import Head from "next/head";
import { GetStaticProps, GetStaticPaths, GetStaticPathsResult } from "next";
import { ParsedUrlQuery } from 'querystring'

import { api } from "../../services/api";
import { getAllCharacters } from "../index";

import md5 from "js-md5";

import styles from "../../styles/Home.module.css";

type Character = {
  id: number;
  name: string;
  description: string;
};

interface CharacterProps {
  character: Character;
}

interface IParams extends ParsedUrlQuery {
  slug: string
}

export default function Character({ character }: CharacterProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Marvel Next App - Pedido Pago</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{character?.name}</h1>

        <p className={styles.description}>
          {character?.description !== "" ? character.description : "Descrição do Personagem Nula"}
        </p>
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async (): Promise<GetStaticPathsResult> => {
  const characters = await getAllCharacters()

  const paths = characters.map(character => {
    return {
      params: {
        slug: String(character.id),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params as IParams

  console.log(`Building slug: ${slug}`)
    
  const ts = Number(new Date());
  const hash = md5.create();
  hash.update(ts + process.env.API_PRIVATE_KEY! + process.env.API_PUBLIC_KEY!);
  const url = `v1/public/characters/${slug}?ts=${ts}&apikey=${process.env.API_PUBLIC_KEY}&hash=${hash}`;
  
  const { data } = await api.get(url);
  const characterData = data.data.results[0]

  const character = {
    id: characterData.id,
    name: characterData.name,
    description: characterData.description,
  };

  return {
    props: { character }
  };
};
