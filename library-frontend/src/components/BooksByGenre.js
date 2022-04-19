import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_BOOKS, Me } from "../queries.js";
import Books from "./Books.js";

export default function BooksByGenre(props) {
  const [genre, setGenre] = useState("");
  
  const booksByGenre = useQuery(ALL_BOOKS, {
    variables: { genre: genre },
  });

  const allBooksGenres = useQuery(gql`
    query AllBooks {
      allBooks {
        genres
      }
    }
  `);

  let books = [];
  if(genre && booksByGenre.loading === false){
      books = booksByGenre.data.allBooks;
  }else if (genre && booksByGenre.loading){
    return <div>loading ...</div>
  }else{
      books = props.books;
  }

  const getAllGenres = () => {
    const genres = [];
    allBooksGenres.data.allBooks.forEach((bk) => {
      bk.genres.forEach((genre) => {
        if (genres.indexOf(genre) === -1) {
          genres.push(genre);
        }
      });
    });
    return genres;
  };

  if (!props.show) return null;

  return (
    <div>
      <Books
        show={true}
        books={books}
        subTitle={{
          text: genre ? "in genre" : "",
          boldText: genre ? genre : "",
        }}
      />
      <span>
        {getAllGenres().map((genre) => (
          <button onClick={() => setGenre(genre)}>{genre}</button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </span>
    </div>
  );
}
