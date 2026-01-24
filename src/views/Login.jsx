import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const API_BASE = import.meta.env.VITE_API_BASE;

function Login({ getProducts, setIsAuth }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  //登入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({ ...preData, [name]: value }));
  };
  //表單按鈕驗證+token存取
  const onSubmit = async (e) => {
    e.preventDefault(); // 阻止表單自動刷新
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data; // 先在這裡拿到
      saveToken(token, expired); // 再傳給函式

      getProducts();
      setIsAuth(true);
    } catch (error) {
      const message = error.response?.data?.message || "表單驗證失敗";
      toast.error(message);
      setIsAuth(false);
    }
  };
  //Cookie存取函式
  const saveToken = (token, expired) => {
    document.cookie = `minToken=${token};expires=${new Date(expired)};`;
    //如果登入成功取得token帶入header
    axios.defaults.headers.common["Authorization"] = token;
  };
  return (
    <>
      {" "}
      <div className="container login">
        <h1>請登入</h1>
        <form className="form-floating " onSubmit={onSubmit}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              name="username"
              placeholder="name@example.com"
              value={formData.username}
              onChange={handleInputChange}
              id="username"
            />
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange(e)}
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="btn btn-primary w-100 mt-3">
            登入
          </button>
        </form>
      </div>
    </>
  );
}
export default Login;
