import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
    }
  }
`;

// addBook(
//     title: String!,
//     published: Int!,
//     author: String!,
//     genres: [String!]
//   ): Book

export const ADD_BOOK = gql`
mutation addBook(
        title: $title,
        published: $published,
        author: $author,
        genres: $genres
      )
`;
