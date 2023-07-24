export const userRegister = (req, res) => {
  const { username, email, password } = req.body;
  const user = User.findOne({ email });
};
