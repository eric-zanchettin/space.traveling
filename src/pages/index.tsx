import { useState } from 'react';

import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser, } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [ nextPage, setNextPage ] = useState(postsPagination.next_page);

  function loadMorePosts() {
    fetch(nextPage)
    .then(response => {
      response.json()
      .then(json => {
        json.results.map(result => {
          postsPagination.results.push(result);
        });

        setNextPage(json.next_page);
      })
    });
  };

  return (
    <>
      <Head>
        <title>Home | space.traveling</title>
      </Head>

      <main className={styles.container}>
        {postsPagination.results.map(post => (
          <article key={post.uid} className={styles.content}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div className={styles.info}>
                  <time><FiCalendar /> {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    },
                  )}</time>
                  <p><FiUser /> {post.data.author}</p>
                </div>
              </a>
            </Link>
          </article>
        ))}
        {nextPage ? <a className={styles.morePosts} onClick={loadMorePosts}>Carregar mais posts</a> : null}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: [
      'posts.title',
      'posts.subtitle',
      'posts.author',
    ],
    pageSize: 1,
  });

  const postsInfo = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data,
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page || null,
        results: postsInfo,
      },
    },
  };
};
