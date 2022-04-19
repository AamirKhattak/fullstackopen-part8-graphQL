const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "GraphQL_TOKEN_KEY_!@#$%^";

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

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
        console.log("if genre", genre);

        return Book.find({ genres: { $in: genre } }).populate("author", {
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
      const { currentUser } = context;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
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
      pubsub.publish("BOOK_ADDED", { bookAdded: book });
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
      const { currentUser } = context;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers
