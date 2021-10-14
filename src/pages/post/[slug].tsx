import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import { RichText, } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock, } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
  uid: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div>Carregando...</div>
    );
  };

  return (
    <>
      <Head>
        <title>{post.data.title} | space.traveling</title>
      </Head>

      <section className={styles.container}>
        <img src={post.data.banner.url} alt="banner" />

        <article className={styles.content}>
          <h1>{post.data.title}</h1>

          <div className={styles.info}>
            <p><FiCalendar /> {format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              },
            )}</p>
            <p><FiUser /> {post.data.author}</p>
            <p><FiClock /> {Math.ceil(post.data.content.reduce((acc, item) => (
              acc += item.heading.split(' ').length + item.body.reduce((acc, bodyText) => (acc += bodyText.text.split(' ').length), 0)
            ), 0) / 200)} min</p>
          </div>

          {post.data.content.map(postContent => (
            <div key={postContent.heading}>
              <h1>{postContent.heading}</h1>
              {postContent.body.map(body => (
                <div
                  key={body.text}
                  className={styles.text}
                  dangerouslySetInnerHTML={{ __html: body.text }}
                />
              ))}
            </div>
          ))}
        </article>
      </section>
    </>
  );
};

export const getStaticPaths = () => {
  return {
    paths: [
      {
        "params": {
          "slug": "como-utilizar-hooks",
        },
      },
      {
        "params": {
          "slug": "criando-um-app-cra-do-zero",
        },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: [...response.data.content],
    },
    uid: response.uid,
  };

  return {
    props: {
      post,
    },
  };
};
