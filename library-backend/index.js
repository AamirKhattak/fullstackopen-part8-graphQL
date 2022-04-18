const { ApolloServer, gql, UserInputError, AuthenticationError } = require("apollo-server");

const jwt = require("jsonwebtoken");
const JWT_SECRET = "GraphQL_TOKEN_KEY_!@#$%^";

const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const config = require("./utils/config")
const MONGODB_URI = config.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

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
`;
const resolvers = {
  Query: {
    me: async (root, args, context) => {
      return context.currentUser;
    },
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const { author, genre } = args;
      if (author && genre) {
        //TODO:
        return Book.find({ author: author, genre: { $in: genre } });
      } else if (author) {
        //TODO:
        return Book.find({ author: author });
      } else if (genre) {
        return Book.find({ genre: { $in: genre } }).populate("author", {
          name: 1,
          born: 1,
        });
      }
      return Book.find({}).populate("author", {
        name: 1,
        born: 1,
      });
    },
    allAuthors: async () => {
      return Author.find({});
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      const { username, favoriteGenre } = args;
      const user = new User({ username, favoriteGenre });
      return user.save().catch((error) => {
        throw new UserInputError(error.message, { invalidArgs: args });
      });
    },
    login: async (root, args) => {
      const { username, password } = args;
      const user = await User.findOne({ username });

      if (!user || password != "test.123") {
        throw new UserInputError("wrong credentials");
      }
      const userForToken = { username, id: user._id };
      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
    addBook: async (root, args, context) => {
      const {currentUser} = context;
      if(!currentUser){
        throw new AuthenticationError("not authenticated")
      }

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
        });
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
        });
      }
      return author;
    },
    editAuthor: async (root, args, context) => {
      const {currentUser} = context;
      if(!currentUser){
        throw new AuthenticationError("not authenticated")
      }

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
        });
      }
      return author;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser }
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
