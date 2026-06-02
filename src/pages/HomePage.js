import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { AiOutlineReload } from "react-icons/ai";
import { API } from "../config";
import "../styles/Homepage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // GET CATEGORY (FIXED: actually used)
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/category/get-category`);
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
    getAllProducts();
  }, []);

  // GET PRODUCTS
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/api/v1/product/product-list/${page}`,
      );
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // TOTAL COUNT
  const getTotal = async () => {
    try {
      const { data } = await axios.get(`${API}/api/v1/product/product-count`);
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  // LOAD MORE (FIXED stale state)
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API}/api/v1/product/product-list/${page}`,
      );
      setLoading(false);

      setProducts((prev) => [...prev, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  // FILTER PRODUCTS
  const filterProduct = async () => {
    try {
      const { data } = await axios.post(
        `${API}/api/v1/product/product-filters`,
        { checked, radio },
      );
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (checked.length || radio.length) {
      filterProduct();
    } else {
      getAllProducts();
    }
  }, [checked, radio]);

  // FILTER HANDLER
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  return (
    <Layout title={"All Products - Best offers"}>
      <img
        src="/images/banner.png"
        className="banner-img"
        alt="bannerimage"
        width={"100%"}
      />

      <div className="container-fluid row mt-3 home-page">
        <div className="col-md-3 filters">
          <h4 className="text-center">Filter By Category</h4>

          <div className="d-flex flex-column">
            {categories?.map((c) => (
              <Checkbox
                key={c._id}
                onChange={(e) => handleFilter(e.target.checked, c._id)}
              >
                {c.name}
              </Checkbox>
            ))}
          </div>

          <h4 className="text-center mt-4">Filter By Price</h4>

          <Radio.Group onChange={(e) => setRadio(e.target.value)}>
            {Prices?.map((p) => (
              <div key={p._id}>
                <Radio value={p.array}>{p.name}</Radio>
              </div>
            ))}
          </Radio.Group>

          <button
            className="btn btn-danger mt-3"
            onClick={() => window.location.reload()}
          >
            RESET FILTERS
          </button>
        </div>

        <div className="col-md-9">
          <h1 className="text-center">All Products</h1>

          <div className="d-flex flex-wrap">
            {products?.map((p) => (
              <div className="card m-2" key={p._id}>
                <img
                  src={`/api/v1/product/product-photo/${p._id}`}
                  className="card-img-top"
                  alt={p.name}
                />

                <div className="card-body">
                  <h5>{p.name}</h5>

                  <h5>
                    {p.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </h5>

                  <p>{p.description.substring(0, 60)}...</p>

                  <button
                    className="btn btn-info ms-1"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  >
                    More Details
                  </button>

                  <button
                    className="btn btn-dark ms-1"
                    onClick={() => {
                      setCart([...cart, p]);
                      localStorage.setItem(
                        "cart",
                        JSON.stringify([...cart, p]),
                      );
                      toast.success("Item Added to cart");
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length < total && (
            <button
              className="btn loadmore m-3"
              onClick={() => setPage(page + 1)}
            >
              {loading ? "Loading..." : "Loadmore"} <AiOutlineReload />
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
