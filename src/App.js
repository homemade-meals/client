import "./scss/custom-theme.scss";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import React, { useReducer, useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import Home from "./components/Home";
import AddNewMeal from "./components/meals-components/AddNewMeal";
import ViewMeal from "./components/meals-components/ViewMeal";
import EditMeal from "./components/meals-components/EditMeal";
import Register from "./components/auth-components/Register";
import Meals from "./components/meals-components/Meals";
import Login from "./components/auth-components/Login";
import Nav from "./components/Nav";

import OrderMeal from "./components/order-components/OrderMeal";
import ViewOrder from "./components/order-components/ViewOrder";
import EditOrder from "./components/order-components/EditOrder";
import OrderTableBuyerView from "./components/order-components/OrderTableBuyerView";

import ShowAlert from "./components/ShowAlert";
import AuthenticatedRoute from "./components/auth-components/AuthenticatedRoute";

import { StateContext } from "./config/store";
import stateReducer from "./config/stateReducer";

import { getAllMeals } from "./services/mealServices";
import { userAuthenticated } from "./services/authServices";
import { getAllOrders } from "./services/orderServices";

const App = () => {
  const initialState = {
    meals: null,
    orders: null,
    error: null,
    info: null,
    ordersLoadFinished: false,
  };
  const [loggedInUser, setLoggedInUser] = useState("not-checked");

  // Create state reducer store and dispatcher
  const [store, dispatch] = useReducer(stateReducer, initialState);

  useEffect(() => {
    userAuthenticated()
      .then((user) => {
        setLoggedInUser(user);
      })
      .catch((error) => {
        console.log("got an error trying to check authenticated user:", error);
        setLoggedInUser(null);
      });
    // return a function that specifies any actions on component unmount
    return () => {};
  }, []);

  useEffect(() => {
    dispatch({
      type: "setOrdersLoadFinished",
      data: true,
    });
    console.log("fetching meals and orders data");
    const { role } = loggedInUser || {};
    getAllMeals(role)
      .then((meals) => {
        dispatch({
          type: "setMeals",
          data: meals,
        });
      })
      .catch((error) => {
        console.log("An error occurred fetching meals from the server:", error);
        dispatch({
          type: "setMeals",
          data: [],
        });
      });
    if (loggedInUser && loggedInUser.role === "buyer") {
      getAllOrders()
        .then((orders) => {
          dispatch({
            type: "setOrders",
            data: orders,
          });
        })
        .catch(() => {
          dispatch({
            type: "setOrders",
            data: [],
          });
        });
    } else {
      dispatch({
        type: "setOrders",
        data: [],
      });
    }
    // return a function that specifies any actions on component unmount
    return () => {};
  }, [loggedInUser]);

  return (
    <div>
      <StateContext.Provider
        value={{ store, dispatch, loggedInUser, setLoggedInUser }}
      >
        <BrowserRouter>
          <Nav />
          <ShowAlert />
          <Container>
            <Row>
              <Col className="mb-3">
                {
                  <Switch>
                    <Route exact path="/register" component={Register} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/" component={Home} />

                    <AuthenticatedRoute
                      exact
                      path="/meals"
                      role="seller"
                      redirectMsg="Please login to view all meals"
                      component={Meals}
                    />
                    <AuthenticatedRoute
                      exact
                      path="/meals/new"
                      role="seller"
                      redirectMsg="Please login to create new meal"
                      component={AddNewMeal}
                    />
                    <AuthenticatedRoute
                      exact
                      path="/meals/:id"
                      role="seller"
                      component={ViewMeal}
                    />
                    <AuthenticatedRoute
                      exact
                      path="/meals/edit/:id"
                      role="seller"
                      redirectMsg="Please login to edit meal"
                      component={EditMeal}
                    />

                    <AuthenticatedRoute
                      exact
                      path="/meals/:id/order"
                      role="buyer"
                      redirectMsg="Please login to make an order"
                      component={OrderMeal}
                    />
                    <AuthenticatedRoute
                      exact
                      path="/orders/:id"
                      role="buyer"
                      redirectMsg="Please login to view your order"
                      component={ViewOrder}
                    />
                    <AuthenticatedRoute
                      exact
                      path="/orders/edit/:id"
                      role="buyer"
                      redirectMsg="Please login to edit your order"
                      component={EditOrder}
                    />
                    <AuthenticatedRoute
                      exact
                      path="/orders"
                      role="buyer"
                      redirectMsg="Please login to see your order history"
                      component={OrderTableBuyerView}
                    />
                    <Route
                      render={() => {
                        dispatch({
                          type: "setError",
                          data: {
                            title: "Sorry that page does not exist!",
                            msg:
                              "Please use navigation to navigate around pages.",
                          },
                        });
                        return <Redirect to="/" />;
                      }}
                    />
                  </Switch>
                }
              </Col>
            </Row>
          </Container>
        </BrowserRouter>
      </StateContext.Provider>
    </div>
  );
};

export default App;
