import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";

import { useApolloClient, useQuery } from "@apollo/client";
import { Me } from "./queries";

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

//TODO: 8.20 recommended partialy done
//TODO: 8.22 Up-to-date cache and book recommendations
//---------------------------------------------------------



const App = () => {
  const [page, setPage] = useState("authors");
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);

  const apolloClient = useApolloClient();
  const currUser = useQuery(Me);
  let favoriteGenre;
  // if(token && currUser.loading === false) favoriteGenre = currUser.data.me.favoriteGenre ? currUser.data.me.favoriteGenre: null ;

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
  };

  const handleLogout = () => {
    if (window.confirm("do you want to logout?")) {
      setToken(null);
      localStorage.clear();
      apolloClient.resetStore(); //to reset cache
    }
  };

  const redirectToPage = (pageName) => setPage(pageName);
  console.log(favoriteGenre);
  

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setPage("recommendedBooks")}>recommended</button>}
        {!token && <button onClick={() => setPage("login")}>login</button>}
        {token && <button onClick={handleLogout}>Logout</button>}
      </div>

      <Notify errorMessage={errorMessage} />
      <Authors show={page === "authors"} setError={notify} token={token}/>
      <Books show={page === "books"} />
      <Books show={page === "recommendedBooks"} recommendedGenre='database' />
      <NewBook show={page === "add"} setError={notify} />
      <Login show={page === "login"} setError={notify} setToken={setToken} redirectToPage={redirectToPage} />
    </div>
  );
};

export default App;
