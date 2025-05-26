import { Request, Response } from 'express';

interface User {
  id: number;
  fullName: string;
  email: string;
}

let registeredUser: User[] = [
  {
    id: 1,
    fullName: "janalam",
    email: "janalam123@gmail.com"
  },
  {
    id: 2,
    fullName: "kamran",
    email: "kamran123@gmail.com"
  }
];

export const fetchUsers = (req: Request, res: Response): void => {
  res.status(200).json(registeredUser);
};

export const postUser = (req: Request, res: Response): void => {
  const { fullName, email } = req.body;

  const user = registeredUser.find(user => user.email === email);
  if (user) {
  res.status(400).json({ message: "User already exists", user });
  return;
  }

  const newUser: User = {
    id: registeredUser.length + 1,
    fullName,
    email
  };

  registeredUser.push(newUser);
  res.status(201).json({ message: "User added successfully", user: newUser });
};

export const findUser = (req: Request, res: Response): void => {
  const userId = parseInt(req.params.id);
  const user = registeredUser.find(user => user.id === userId);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const editUser = (req: Request, res: Response): void => {
  const { fullName, email } = req.body;
  const userId = parseInt(req.params.id);

  const userIndex = registeredUser.findIndex(user => user.id === userId);

  if (userIndex !== -1) {
    registeredUser[userIndex].fullName = fullName;
    registeredUser[userIndex].email = email;

    res.status(200).json({ msg: "User Updated", user: registeredUser[userIndex] });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const deleteUser = (req: Request, res: Response): void => {
  const userId = parseInt(req.params.id);
  const index = registeredUser.findIndex(user => user.id === userId);

  if (index !== -1) {
    const deletedUser = registeredUser.splice(index, 1);
    res.status(200).json({ message: "User deleted successfully", user: deletedUser[0] });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};