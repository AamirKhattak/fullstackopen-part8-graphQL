import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_BOOKS, Me } from "../queries.js";

const Books = (props) => {
  const {recommendedGenre} = props;

  const [genre, setGenre] = useState(
    recommendedGenre ? recommendedGenre : null
  );

  const result = useQuery(ALL_BOOKS, {
    variables: { genre: genre },
    fetchPolicy: "no-cache",
  });

  const allBooks = useQuery(gql`
    query AllBooks {
      allBooks {
        genres
      }
    }
  `);

  if (!props.show) return null;
  else if (result.loading) return <div>loading ...</div>;

  const books = result.data.allBooks;

  if (recommendedGenre) {
    return (
      <div>
        <h2>recommendations</h2>
        <p>
          books in your favorite genre <b>{genre}</b>
        </p>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const getAllGenres = () => {
    const genres = [];
    allBooks.data.allBooks.forEach((bk) => {
      bk.genres.forEach((genre) => {
        if (genres.indexOf(genre) === -1) {
          genres.push(genre);
        }
      });
    });
    return genres;
  };

  return (
    <div>
      <h2>books</h2>
      {genre && (
        <p>
          in genre <b>{genre}</b>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span>
        {getAllGenres().map((genre) => (
          <button onClick={() => setGenre(genre)}>{genre}</button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </span>
    </div>
  );
};

export default Books;
