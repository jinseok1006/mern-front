import { useState, useEffect } from 'react';
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'moment/dist/locale/ko';
import axios, { AxiosError } from 'axios';
import useAsync from './useAysnc';

import { Loading } from './commons';
import AccessLogPage from './AccessLogPage';
import NewMdPostPage from './NewMdPostPage';
import { NewHtmlPostPage } from './NewHtmlPostPage';

export default function App() {
  useEffect(() => {
    axios.defaults.withCredentials = true;
    moment.locale('ko');
    console.log('update');
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/posts">
        <Route index element={<PostsPage />} />
        <Route path=":id">
          <Route index element={<PostDetailPage />} />
          <Route path="edit" element={<PostEditPage />} />
        </Route>
        <Route path="new" element={<NewPostPage />} />
      </Route>
      <Route path="/new-md" element={<NewMdPostPage />} />
      <Route path="/new-dom" element={<NewHtmlPostPage />} />
      <Route path="/access-log" element={<AccessLogPage />} />
    </Routes>
  );
}

interface IPostAccessResponse {
  message?: string;
  available: boolean;
}

const verifyPostAccess = async (postId: number, password: string): Promise<IPostAccessResponse> => {
  try {
    await axios.post(`${import.meta.env.VITE_API_SERVER}/posts/${postId}/auth`, { password });
    return { available: true };
  } catch (err) {
    console.error(err);
    return {
      available: false,
      message: (err as AxiosError<{ message: string }>).response?.data.message!,
    };
  }
};

function PostDeleteButton({ postId }: { postId: number }) {
  const navigate = useNavigate();
  const deletePost = async (postId: number) =>
    (await axios.delete(`${import.meta.env.VITE_API_SERVER}/posts/${postId}`)).data;

  const handleDelete = async () => {
    const password = prompt('비밀번호를 입력해주세요.');
    if (!password) return;

    // try {
    //   await verifyPostAccess(postId, password);
    // } catch (err) {
    //   alert((err as AxiosError<{ message: string }>).response?.data.message);
    //   return console.error(err);
    // }
    const postAccessResponse = await verifyPostAccess(postId, password);
    if (!postAccessResponse.available) return alert(postAccessResponse.message);

    const check = confirm('정말로 삭제할까요?');
    if (!check) return;

    try {
      await deletePost(postId);
      alert('success');
      navigate('/posts');
    } catch (err) {
      const error = err as Error;
      alert('error');
      return console.error(error.message);
    }
  };

  return <button onClick={() => handleDelete()}>삭제</button>;
}

interface IPost {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

const fetchPost = async (postId: number): Promise<IPost> =>
  (await axios.get(`${import.meta.env.VITE_API_SERVER}/posts/${postId}`)).data;

function PostDetailPage() {
  const params = useParams();
  const postId = parseInt(params.id!);

  const { data: post, isLoading, error } = useAsync(() => fetchPost(postId));

  if (error) {
    return <ErrorPage message={error.message} />;
  }

  if (isLoading || !post) return <Loading />;
  const { title, content, author, createdAt } = post;
  return (
    <>
      <PostDetail
        id={post.id}
        title={title}
        author={author}
        createdAt={createdAt}
        content={content}
      />
      <div className="컨트롤패널 분리">
        <Link to="/posts">
          <button>목록으로</button>
        </Link>
        <PostEditButton postId={postId} />
        <PostDeleteButton postId={postId} />
      </div>
    </>
  );
}

function PostEditButton({ postId }: { postId: number }) {
  const navigate = useNavigate();
  const handleClick = async () => {
    const password = prompt('비밀번호를 입력해주세요.');
    if (!password) return;

    const accessResponse = await verifyPostAccess(postId, password);
    if (!accessResponse.available) {
      return alert(accessResponse.message);
    }

    navigate('edit');
  };

  return <button onClick={handleClick}>수정하기</button>;
}

function PostDetail({ title, author, createdAt, content }: IPost) {
  return (
    <div>
      <h1>{title}</h1>
      <div>
        <span>{author}</span> <span>{moment(new Date(createdAt)).fromNow()}</span>
      </div>
      <p dangerouslySetInnerHTML={{ __html: content }}></p>
    </div>
  );
}

interface IPostForm {
  title: string;
  content: string;
  author: string;
  password: string;
}
const createPost = async (postForm: IPostForm) =>
  (await axios.post(`${import.meta.env.VITE_API_SERVER}/posts`, postForm)).data;

function NewPostPage() {
  const [inputs, setInputs] = useState<IPostForm>({
    title: '',
    content: '',
    author: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost(inputs);
      alert('success');
      navigate('/posts');
    } catch (err) {
      console.error(err);
    }
  };

  const { title, content, author, password } = inputs;

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" value={title} onChange={handleChange} placeholder="title" />
      <input
        type="text"
        name="author"
        value={author}
        onChange={handleChange}
        placeholder="author"
      />
      <input
        type="password"
        name="password"
        value={password}
        onChange={handleChange}
        placeholder="password"
      />
      <textarea name="content" value={content} onChange={handleChange} placeholder="content" />
      <input type="submit" />
    </form>
  );
}

function HomePage() {
  return (
    <>
      <h1>Hello</h1>
      <div>
        <Link to="/posts">go to posts</Link>
        <br />
        <Link to="/access-log">go to accesss-log</Link>
      </div>
    </>
  );
}

const fetchPosts = async (): Promise<IPost[]> =>
  (await axios.get(`${import.meta.env.VITE_API_SERVER}/posts`)).data;

function PostList() {
  const { data: posts, isLoading, error } = useAsync(fetchPosts);

  if (isLoading) return <Loading />;
  if (error) return <div>error occured</div>;
  if (!posts) return null;

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <span>{post.id}</span>

          <Link to={`${post.id}`}>
            <span>{post.title}</span>
          </Link>
          <span>{post.author}</span>
          <span>{moment(post.createdAt).fromNow()}</span>
        </li>
      ))}
    </ul>
  );
}

function PostsPage() {
  return (
    <>
      <PostList />
      <div className="컨트롤 패널 분리">
        <Link to="/posts/new">
          <button>게시글 작성</button>
        </Link>
      </div>
    </>
  );
}

interface IPostEditForm {
  title: string;
  content: string;
}

const editPost = async (postId: number, postForm: IPostEditForm) =>
  (await axios.put(`${import.meta.env.VITE_API_SERVER}/posts/${postId}`, postForm)).data;

function PostEditPage() {
  const params = useParams();
  const navigate = useNavigate();

  if (!params.id) return <div>error</div>;
  const postId = parseInt(params.id);

  const { data: post, isLoading, error } = useAsync(() => fetchPost(postId));
  const [inputs, setInputs] = useState<IPostEditForm>({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (!isLoading && !error && post) {
      setInputs({
        title: post.title || '',
        content: post.content || '',
      });
    }
  }, [post, isLoading, error]);
  const { title, content } = inputs;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await editPost(postId, inputs);
      alert('success');
      navigate('/posts');
    } catch (err) {
      alert('오류발생');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" value={title} onChange={handleChange} />
      <input type="text" name="author" value={post?.author || ''} disabled />
      <input type="password" name="password" value="passwrod" disabled />
      <textarea name="content" value={content} onChange={handleChange} />
      <input type="submit" />
    </form>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <h1>{message.toUpperCase()}</h1>
    </div>
  );
}
