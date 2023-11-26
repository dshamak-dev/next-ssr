import Link from "next/link.js";
import { useEffect, useState } from "react";
import styles from "../styles/Index.module.scss";
import PageHead from "../components/PageHead.js";

const _words = ["contest", "fun", "better", "creative", "competitive"];
const _delay = 1000;

export const Index = () => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const _interval = setInterval(() => {
      setWordIndex((index) => {
        return (index + 1) % _words.length;
      });
    }, _delay);

    return () => {
      clearInterval(_interval);
    };
  }, []);

  return (
    <>
      <PageHead />
      <main className={styles.main}>
        <h1 className={styles.title}>
          <span>make everything</span>
          <span>{_words[wordIndex]}</span>
        </h1>
        <div className="flex gap-1 items-center">
          <Link href="/login" className={styles.link}>
            Login
          </Link>
          <Link href="/games" className={styles.link}>Games</Link>
        </div>
      </main>
    </>
  );
};

export default Index;
