import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Modal } from "bootstrap";
import axios from "axios";
import "./assets/style.css";
import ProductModal from "./assets/components/ProductModal";
import Pagination from "./assets/components/Pagination";
import Login from "./views/Login";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

//建立初始化資料
const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
  vegetarian: "",
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setproducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  //控制目前modal是新增還是編輯還是刪除
  const [modalType, setModalType] = useState("");
  //分業物件
  const [pagination, setPageination] = useState({});
  const productsModalRef = useRef(null);

  //Cookie存取函式
  const saveToken = (token, expired) => {
    document.cookie = `minToken=${token};expires=${new Date(expired)};`;
    //如果登入成功取得token帶入header
    axios.defaults.headers.common["Authorization"] = token;
  };
  //Cookie取得函式
  const loadToken = () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("minToken="))
      ?.split("=")[1];
    //先判斷是否有token，取得token帶入header
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
    return token;
  };
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = loadToken();
        //判斷是否有token沒有就跳出
        if (!token) return;
        const res = await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        const messages = error.response?.data?.message;
        toast.error(
          Array.isArray(messages)
            ? messages.join(", ")
            : messages || "登入失敗",
        );
        setIsAuth(false);
      }
    };
    productsModalRef.current = new Modal(
      document.getElementById("productModal"),
    );
    checkLogin();
  }, []);

  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct(() => ({ ...INITIAL_TEMPLATE_DATA, ...product }));
    productsModalRef.current.show();
  };
  const closeModal = () => {
    productsModalRef.current.hide();
  };

  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setproducts(res.data.products);
      //取得物件時也要取得分頁結構
      setPageination(res.data.pagination);
    } catch (error) {
      const messages = error.response?.data?.message;
      toast.error(
        Array.isArray(messages)
          ? messages.join(", ")
          : messages || "取得商品失敗",
      );
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {!isAuth ? (
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
      ) : (
        <div className="container mt-4">
          <h2 className="fw-bold dark-coffee-text mb-3">產品列表</h2>
          <div className="text-end mb-4">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
            >
              建立新產品
            </button>
          </div>
          <table className="table table-hover table-dark table-striped table-borderless">
            <thead>
              <tr>
                <th> 分類</th>
                <th> 產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
              </tr>
            </thead>
            <tbody className="align-middle">
              {products.map((item) => (
                <tr key={item.id}>
                  <td>{item.category}</td>
                  <td className="py-3">{item.title}</td>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td className={`${item.is_enabled && "text-warning"}`}>
                    {item.is_enabled ? "啟用" : "未啟用"}
                  </td>
                  <td>
                    <div
                      className="btn-group"
                      role="group"
                      aria-label="Basic example"
                    >
                      <button
                        type="button"
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => openModal("edit", item)}
                      >
                        編輯
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openModal("delete", item)}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination pagination={pagination} onChangePage={getProducts} />
        </div>
      )}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        getProducts={getProducts}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
