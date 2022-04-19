import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_BOOKS, Me } from "../queries.js";
import Books from "./Books.js";

export default function BooksByRecommendation(props) {
  const favoriteGenre = props.favoriteGenre;
  const [genre, setGenre] = useState(favoriteGenre ? favoriteGenre : "");

  const recommendedBooks = useQuery(ALL_BOOKS, {
    variables: { genre: genre },
  });

  if (!props.show) return null;

  let books = [];
  let pageHeader = "Books";
  let pageSubHeader = "";
  if (favoriteGenre && recommendedBooks.loading === false) {
    //   pageHeader = "recommendations";
    //   pageSubHeader=`books in your favorite genre ${genre}`
    books = recommendedBooks.data.allBooks;
  }

  return (
    <Books
      show={true}
      books={books}
      title="recommendations"
      subTitle={{
        text: "books in your favorite genre ",
        boldText: favoriteGenre,
      }}
    />
  );
}
