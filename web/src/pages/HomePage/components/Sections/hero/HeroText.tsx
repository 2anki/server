import React from 'react';
import styles from './Hero.module.css';

interface HeroTextProps {
  children: React.ReactNode;
}

function HeroText({ children }: Readonly<HeroTextProps>) {
  return <p className={styles.heroParagraph}>{children}</p>;
}

export default HeroText;
