"use client";
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { MdDelete } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const Home = () => {
  const [data, setData] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [add, setAdd] = useState(false);
  const [todoData, setTodo] = useState("");
  useEffect(() => {
    async function fetchTodo() {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/todo");
      const data = await res.json();
      if (data) {
        setData(data);
        console.log(data);
      }
      setLoading(false);
    }
    fetchTodo();
  }, []);

  const handleAdd = async (event: SyntheticEvent) => {
    event.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/todo/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: todoData,
          completed: false,
        }),
      });

      const result = await res.json();
      console.log(result);
      setData((e) => [...e, result]);
      setAdd(false);
      setTodo("");
      console.log("Success: ", result);
    } catch (err) {
      console.log("Failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/todo/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        console.log("Deleted");
        setData(data.filter((i) => i.id != id));
      } else {
        console.log("Error");
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const FindTodo = data.find((item) => item.id == id);
      
      if (!FindTodo) {
        console.error("Todo not found!");
        return;
      }
      const updatedTodo = {
        ...FindTodo,
        completed: true,
      };
      setData(data.map((todo) => (todo.id == id ? updatedTodo : todo)));

      const res = await fetch(`http://localhost:8080/api/todo/${id}`, {
        method: "PUT",
        headers: {
          // <-- ADD THIS
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });
      if (res.ok) {
        console.log("Updated");
      } else {
        console.log("Error");
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  const dragPerson = useRef<number>(0);
  const dragOverPerson = useRef<number>(0);

  const handleSort = async () => {
    const copyOfData = [...data];
    const tmp = copyOfData[dragPerson.current];
    copyOfData[dragPerson.current] = copyOfData[dragOverPerson.current];
    copyOfData[dragOverPerson.current] = tmp;
    setData(copyOfData);
  };

  if (loading) return <div>Loading...</div>;
  return (
    <section className="relative min-h-dvh bg-gray-50 py-[2rem] px-[2rem] lg:px-[5rem]">
      <div>
        <h2 className="text-center text-4xl font-bold">Welcome to Todo</h2>
        <p className="text-gray-600 text-center">
          You can Perform CRUD operations
        </p>
      </div>
      <div className="w-full py-[3rem]">
        <ul className="max-w-[45rem] flex flex-col gap-2 mx-auto border border-gray-900 px-3 py-3 rounded shadow-2xl">
          {data.sort((x,y) => (x.completed ? 1 : 0) - (y.completed ? 1: 0)).map((todo, index) => (
            <li
              draggable
              onDragStart={() => (dragPerson.current = index)}
              onDragEnter={() => (dragOverPerson.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              key={todo.id}
              className="flex justify-between items-center gap-[5rem] border border-gray-900 px-7 py-4 rounded shadow-2xl bg-black text-white font-semibold"
            >
              <div>{index + 1}</div>
              <p>{todo.title}</p>
              <p
                className={`${
                  todo.completed ? "text-green-500" : "text-blue-500"
                }`}
              >
                {todo.completed ? "Completed" : "Not Completed"}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="cursor-pointer"
                >
                  <MdDelete className="text-red-500 text-lg" />
                </button>
                <button
                  onClick={(e) => handleUpdate(todo.id)}
                  className={`${todo.completed ? "hidden" : ""} cursor-pointer`}
                >
                  <FaCheckCircle className="text-green-500 " />
                </button>
              </div>
            </li>
          ))}
          <li className="p-2">
            <button
              onClick={() => setAdd(true)}
              className="w-full cursor-pointer border border-gray-900 px-3 py-3 hover:bg-black hover:text-white transition-all ease-linear delay-100 rounded shadow-2xl"
            >
              <p className="text-center text-lg">Add Todo +</p>
            </button>
          </li>
        </ul>
      </div>
      <div
        className={`${
          add ? "" : "hidden"
        } fixed flex justify-center items-center w-full z-20 bg-gray-600/20 top-0 left-0 right-0 bottom-0 backdrop-blur-sm`}
      >
        <div className="bg-black text-white p-4 rounded min-w-[20rem] relative">
          <button
            onClick={() => setAdd(false)}
            className="cursor-pointer absolute right-2 top-1 font-semibold text-xl"
          >
            <p className="">X</p>
          </button>
          <h3 className="text-center text-2xl font-semibold">Add Todo</h3>
          <div className="flex flex-col gap-2 py-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-sm">
                Title
              </label>
              <input
                className="outline-0 border border-white rounded px-2 py-1 text-lg"
                type="text"
                onChange={(e) => setTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAdd(e);
                  }
                }}
                value={todoData}
                placeholder="Your title"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 py-2">
            <button
              onClick={(e) => handleAdd(e)}
              className="cursor-pointer w-full bg-white text-black py-1 rounded font-semibold text-xl"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
