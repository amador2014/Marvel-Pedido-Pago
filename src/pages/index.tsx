import Head from "next/head";
import Link from "next/link"
import { GetStaticProps } from "next";

import { api } from "../services/api";
import md5 from "js-md5";

import styles from "../styles/Home.module.css";

type Character = {
  id: number;
  name: string;
  description: string;
};

interface HomeProps {
  characters: Character[];
}

export default function Home({ characters }: HomeProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Marvel Next App - Pedido Pago</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">UI Marvel Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.characterContent}>
          {characters?.map(character => {
            return (
              <p key={character.id}>
                <Link href={`/characters/${character.id}`}>
                  <a>{character.name}</a>
                </Link>
              </p>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// gets all characters from the API through a sequence of requests
export async function getAllCharacters(): Promise<Character[]> {
  const ts = Number(new Date());
  const hash = md5.create();
  hash.update(ts + process.env.API_PRIVATE_KEY! + process.env.API_PUBLIC_KEY!);
  const url = `v1/public/characters?ts=${ts}&apikey=${process.env.API_PUBLIC_KEY}&hash=${hash}`;

  let allCharacters = [] as Character[];

  //get total characters api
  // const { data } = await api.get(url, { params: { limit: 1 } });
  const totalApiCharacters = 400; //data.data.total

  const limitItensPerRequest = 100;
  const requestTimes = Math.ceil(totalApiCharacters / limitItensPerRequest);

  for (let index = 0; index < requestTimes; index++) {
    if (allCharacters.length == totalApiCharacters) break;

    const { data } = await api.get(url, {
      params: {
        offset: allCharacters.length === 0 ? 0 : allCharacters.length + 1,
        limit: limitItensPerRequest,
        orderBy: "name",
      },
    });

    data.data.results?.map((character: Character) => {
      const currentCharacter = {
        id: character.id,
        name: character.name,
        description: character.description,
      };

      allCharacters = [...allCharacters, currentCharacter];
    });
  }

  return allCharacters;
}

export const getStaticProps: GetStaticProps = async context => {
  try {
    const characters = await getAllCharacters();

    return {
      props: {
        characters,
      },
    };
  } catch (exe) {
    throw new Error(exe.Message);
  }
};
