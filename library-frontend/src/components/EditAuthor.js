import { useMutation } from "@apollo/client";
import React from "react";
import {ALL_AUTHORS, EDIT_AUTHOR } from "../queries.js";

export default function EditAuthor(props) {

    const {authors, setError} = props;

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => setError(error.graphQLErrors[0].message),
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleOnSubmitBirthYear = (event) => {
    event.preventDefault();
    const name = event.target.ddlName.value;
    const born = Number(event.target.born.value);
    event.target.ddlName.value = "";
    event.target.born.value = "";
    editAuthor({ variables: { name, setBornTo: born } });
  };

  return (
    <div>
      <h1>Set Birthyear</h1>
      <form onSubmit={handleOnSubmitBirthYear}>
        <div>
          name
          <select name="ddlName">
            {authors.map((author) => (
              <option value={author.name}>{author.name}</option>
            ))}
          </select>
        </div>
        {/* <div>
        name <input name="name" />
      </div> */}
        <div>
          born <input name="born" type="number" />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
}
