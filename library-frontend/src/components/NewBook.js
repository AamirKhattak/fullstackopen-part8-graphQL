import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS } from "../queries.js";

const NewBook = (props) => {
  const [title, setTitle] = useState(`test book name ${new Date().getTime()}`);
  const [author, setAuthor] = useState("aamir");
  const [published, setPublished] = useState("1990");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState(['gql', 'general']);

  const { setError } = props;
  const [addBook] = useMutation(ADD_BOOK, {
    onError: (error) => setError(error.graphQLErrors[0].message),
    update: (cache, response) => {
      cache.updateQuery({query: ALL_BOOKS}, ({allBooks}) => {
        console.log(allBooks.concat(response.data.addBook));        
        return {
          allBooks: allBooks.concat(response.data.addBook)
        }
      })
    }
  });

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    console.log("add book...");
    const publishedYear = Number(published);

    addBook({ variables: { title, author, published: publishedYear, genres } });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
