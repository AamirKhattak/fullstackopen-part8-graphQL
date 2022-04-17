const { ApolloServer, gql, UserInputError } = require("apollo-server");
const { v1: uuid } = require("uuid");

const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
// MONGODB_URI=mongodb+srv://aamirkhattak:mongoDB.1234@cluster0.22bwu.mongodb.net/bloglist-app?retryWrites=true&w=majority
const MONGODB_URI =
  "mongodb+srv://aamirkhattak:mongoDB.1234@cluster0.22bwu.mongodb.net/bloglist-app?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });


const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
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
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [AllAuthors]
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]
    ): Book
    addAuthor(name: String!, born: Int): Author
    editAuthor(name: String, setBornTo: Int): Author
  }
`;
const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      const { author, genre } = args;
      if (author && genre) {
        return books.filter(
          (book) =>
            book.author === author &&
            book.genres.find((currGenre) => currGenre === genre)
        );
      } else if (author) {
        const authorName = author;
        return books.filter((book) => book.author === authorName);
      } else if (genre) {
        const genreName = genre;
        return books.filter((book) =>
          book.genres.find((genre) => genre === genreName)
        );
      }
      return books;
    },
    allAuthors: () => {
      let authorInfo = [];
      authors.forEach((author) => {
        const authorName = author.name;
        const authorBooks = books.filter((book) => book.author === authorName);
        authorInfo.push({
          name: author.name,
          born: author.born,
          bookCount: authorBooks.length,
        });
      });
      return authorInfo;
    },
  },
  Mutation: {
    addBook: (root, args) => {
      const newBook = { ...args, id: uuid() };
      books = books.concat(newBook);

      if (!authors.find((author) => author.name === newBook.author)) {
        authors = authors.concat({
          name: newBook.author,
          born: null,
          id: uuid(),
        });
      }
      return newBook;
    },
    addAuthor: (root, args) => {
      const { name } = args;
      const born = args.born ? args.born : null;
      const newAuthor = { name: name, born: born, id: uuid() };
      authors = authors.concat(newAuthor);
      return newAuthor;
    },
    editAuthor: (root, args) => {
      const { name, setBornTo } = args;

      let authorToBeUpdated = authors.find((author) => author.name === name);
      if (!authorToBeUpdated) return null;
      authorToBeUpdated.born = setBornTo;
      return authorToBeUpdated;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
