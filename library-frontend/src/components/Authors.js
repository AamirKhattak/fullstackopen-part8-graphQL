import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries.js";
import EditAuthor from "./EditAuthor.js";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const {setError, token} = props;

  if (!props.show) return null;
  else if (result.loading) return <div>loading ...</div>;
  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <EditAuthor authors={authors} setError={setError}/> */}
      { token && <EditAuthor authors={authors} setError={setError}/>}
    </div>
  );
};

export default Authors;
