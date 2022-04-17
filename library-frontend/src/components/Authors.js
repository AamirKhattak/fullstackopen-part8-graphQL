import { gql, useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries.js";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => console.error(error),
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (!props.show) return null;
  else if (result.loading) return <div>loading ...</div>;

  const authors = result.data.allAuthors;

  const handleOnSubmitBirthYear = (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const born = Number(event.target.born.value);
    event.target.name.value = "";
    event.target.born.value = "";

    editAuthor({ variables: { name, setBornTo: born } });
  };

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
      <h1>Set Birthyear</h1>
      <form onSubmit={handleOnSubmitBirthYear}>
        <div>
          name <input name="name" />
        </div>
        <div>
          born <input name="born" type="number" />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
