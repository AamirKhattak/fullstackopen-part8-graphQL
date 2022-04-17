const { ApolloServer, gql, UserInputError } = require("apollo-server");
const { v1: uuid } = require("uuid");

const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
// MONGODB_URI=mongodb+srv://aamirkhattak:mongoDB.1234@cluster0.22bwu.mongodb.net/bloglist-app?retryWrites=true&w=majority
const MONGODB_URI =
  "mongodb+srv://aamirkhattak:mongoDB.1234@cluster0.22bwu.mongodb.net/library?retryWrites=true&w=majority";

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
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const { author, genre } = args;
      if (author && genre) { //TODO:
        return Book.find({ author: author, genre: { $in: genre } });
      } else if (author) { //TODO:
        return Book.find({ author: author });
      } else if (genre) {
        return Book.find({ genre: { $in: genre } });
      }
      return Book.find({});
    },
    allAuthors: async () => {
      return Author.find({});
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author, born: null });
        author = await author.save();
      }
      const book = new Book({ ...args, author: author._id.toString() });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return book;
    },
    addAuthor: async (root, args) => {
      const { name } = args;
      const born = args.born ? args.born : null;
      const author = new Author({ name: name, born: born });

      try {
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author;
    },
    editAuthor: async (root, args) => {
      const { name, setBornTo } = args;
      let author;
      try {
        author = await Author.findOneAndUpdate(
          { name },
          { born: setBornTo },
          { new: true }
        );
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return author;
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
