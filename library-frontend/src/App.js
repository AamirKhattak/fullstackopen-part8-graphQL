import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";

import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import { BOOK_ADDED, Me, ALL_BOOKS } from "./queries";
import BooksByRecommendation from "./components/BooksByRecommendation";
import BooksByGenre from "./components/BooksByGenre";

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

//TODO: 8.26 pending n+1
//---------------------------------------------------------

const App = () => {
  const [page, setPage] = useState("authors");
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);

  const apolloClient = useApolloClient();
  const allBooks = useQuery(ALL_BOOKS);
  const currUser = useQuery(Me);
  let favoriteGenre;
  // if(token && currUser.loading === false) favoriteGenre = currUser.data.me.favoriteGenre ? currUser.data.me.favoriteGenre: null ;

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  console.log(currUser);
  
  // useEffect(() => {
  //   if ( currUser.data ) {
  //     const token = currUser.data.login.value
  //     setToken(token)
  //     localStorage.setItem('phonenumbers-user-token', token)
  //   }
  // }, [currUser.data])

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData);
      const bookAdded = subscriptionData.data.bookAdded;
      notify(`${bookAdded.title} added.`);

      apolloClient.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(bookAdded),
        };
      });
    },
  });

  if (allBooks.loading) return <div>loading...</div>;
  if (currUser.loading && !token) {
    return <div>loading...</div>;
  } else {
    favoriteGenre = currUser.data.me.favoriteGenre;
  }

  const handleLogout = () => {
    if (window.confirm("do you want to logout?")) {
      setToken(null);
      localStorage.clear();
      apolloClient.resetStore(); //to reset cache
    }
  };

  const redirectToPage = (pageName) => setPage(pageName);
  console.log(currUser);
  console.log(favoriteGenre);

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && (
          <button onClick={() => setPage("recommendedBooks")}>
            recommended
          </button>
        )}
        {!token && <button onClick={() => setPage("login")}>login</button>}
        {token && <button onClick={handleLogout}>Logout</button>}
      </div>

      <Notify errorMessage={errorMessage} />
      <Authors show={page === "authors"} setError={notify} token={token} />
      <BooksByGenre show={page === "books"} books={allBooks.data.allBooks} />
      <BooksByRecommendation show={page === "recommendedBooks"} favoriteGenre={favoriteGenre} />
      <NewBook show={page === "add"} setError={notify} />
      <Login
        show={page === "login"}
        setError={notify}
        setToken={setToken}
        redirectToPage={redirectToPage}
      />
    </div>
  );
};

export default App;
