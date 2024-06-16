import { useState } from "react";
import "./App.css";

type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  country: string;
  occupation: string;
};

const APP_STATUS = {
  IDLE: "IDLE",
  ERROR: "ERROR",
  UPLOADING: "UPLOADING",
  READY_UPLOAD: "READY_UPLOAD",
  READY_SEARCH: "READY_SEARCH",
  SEARCHING: "SEARCHING",
} as const;
type AppStatus = (typeof APP_STATUS)[keyof typeof APP_STATUS];

function App() {
  const [appStatus, setAppStatus] = useState<AppStatus>(APP_STATUS.IDLE);
  const [users, setUsers] = useState<User[]>([]);

  const onUploadFile = async (e: React.FormEvent<HTMLFormElement>) => {
    // multipart/form-data
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch("http://localhost:3000/api/files", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);
  };

  const onSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get("q") as string;

    const query = `?q=${searchTerm.trim()}`;

    const response = await fetch(`http://localhost:3000/api/users${query}`);
    const result = await response.json();
    setUsers(result.data as User[]);
  };

  console.log(users);

  return (
    <>
      <>
        <h2>Upload CSV</h2>
        <p>Upload a CSV file and search for users</p>
        <form onSubmit={onUploadFile}>
          <input type="file" name="file" accept=".csv" />
          <button type="submit">Upload</button>
        </form>
      </>

      <h2>Search</h2>
      <p>Search for users by name, email, country, or occupation</p>
      <form onSubmit={onSearch}>
        <input type="text" name="q" />
        <button type="submit">Search</button>
      </form>

      <p>
        {users?.map((user) => (
          <div key={user.id}>
            {user.name} - {user.email} - {user.country} - {user.occupation}
          </div>
        ))}
      </p>

      <p>
        {JSON.stringify(
          users,
          (key, value) => (typeof value === "object" ? undefined : value),
          2
        )}
      </p>
    </>
  );
}

export default App;
