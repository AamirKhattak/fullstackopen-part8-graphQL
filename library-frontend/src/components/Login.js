import { useMutation } from "@apollo/client";
import React, { useEffect } from "react";
import { LOGIN } from "../queries";

export default function Login(props) {
const { show, setError, setToken, redirectToPage }= props;

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("library-user-token", token);      
    }
  }, [result.data]);

  if (!show) return null;

  const handleOnLogin = async (event) => {
    event.preventDefault();

    const username = event.target.username.value;
    const password = event.target.password.value;
    console.log(username, password);
    await login({ variables: { username, password } });
  };

  return (
    <div>
      <form onSubmit={handleOnLogin}>
        <div>
          username <input name="username" />
        </div>
        <div>
          password <input type="password" name="password" />
        </div>
        <div>
          <button type="submit">login</button>
        </div>
      </form>
    </div>
  );
}
