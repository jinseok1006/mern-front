import ReactMarkDown from 'react-markdown';
import { useState } from 'react';
import styles from './NewMdPostPage.module.css';
export default function NewMdPostPage() {
  const [mdText, setMdText] = useState('');

  const onMdTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    void setMdText(e.target.value);

  return (
    <>
      <div className={styles.block}>
        <textarea value={mdText} onChange={onMdTextChange} className={styles.textArea}></textarea>
        <div className={styles.output}>
          <ReactMarkDown>{mdText ?? ''}</ReactMarkDown>
        </div>
      </div>
      <div>{mdText}</div>
    </>
  );
}
