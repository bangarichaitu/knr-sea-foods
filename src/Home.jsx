import { useEffect, useState } from "react";

export const Home = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");

  const changeHandler = (e) => {
    console.log(e.target.value);
    setQuery(e.target.value);
  };

  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/posts?q=${query}`)
      .then((resp) => {
        if (!resp.ok) throw new Error("Network issue");

        return resp.json();
      })
      .then((data) => setPosts(data));
  }, [query]);
  return (
    <>
      <div>Posts</div>
      <input
        type="text"
        onChange={changeHandler}
        placeholder="search post here ..."
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <>
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.body}</td>
                </tr>
              </>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No Posts Found</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default Home;
