const { gql } = require("apollo-server");

const typeDefs = gql`

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Book {
    title: String!
    published: Int!
    author: Author
    genres: [String!]
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
  }

  type AllAuthors {
    name: String
    born: Int
    bookCount: Int
  }

  type Query {
    me: User
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [AllAuthors]
  }

  type Mutation {
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]
    ): Book
    addAuthor(name: String!, born: Int): Author
    editAuthor(name: String, setBornTo: Int): Author
  }

  type Subscription {
    bookAdded: Book!
  }    
`;

module.exports = typeDefs