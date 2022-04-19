import { gql, useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_BOOKS, Me } from "../queries.js";

const Books = (props) => {

  if (!props.show) return null;

  let books = props.books;
  let pageTitle = props.title? props.title : "Books"
  let pageSubTitle = props.subTitle ? props.subTitle.text : ""
  let pageSubTitleBold = props.subTitle ? props.subTitle.boldText : ""

  return (
    <div>
      <h2>{pageTitle}</h2>
      <p>{pageSubTitle}&nbsp;<b>{pageSubTitleBold}</b></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
