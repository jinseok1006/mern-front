import React, { useEffect, useState } from 'react';
import styles from './NewMdPostPage.module.css';

const parseHtmlToComponentTree = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const traverse = (node: Element): React.ReactNode => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      const props: { [name: string]: string } = {};

      for (const attr of node.attributes) {
        props[attr.name] = attr.value;
      }

      const children = Array.from(node.childNodes).map((e) => traverse(e as Element));
      return React.createElement(tagName, props, children);
    } else if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else {
      return null;
    }
  };

  console.log(doc.body.innerHTML);
  const componentTree = traverse(doc.body);

  return componentTree;
};

export function NewHtmlPostPage() {
  const [postText, setPostText] = useState('');
  const onPostTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setPostText(e.target.value);

  // const componentTree = parseHtmlToComponentTree(postText);

  // useEffect(() => {
  //   console.log(componentTree?.toString());
  // }, [postText]);

  return (
    <div className={styles.block}>
      <textarea value={postText} onChange={onPostTextChange} className={styles.textArea}></textarea>
      <div className={styles.output} dangerouslySetInnerHTML={{ __html: postText }}></div>
    </div>
  );
}
