import "react-datepicker/dist/react-datepicker.css";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import DatePicker from 'react-datepicker'

import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import { useGlobalState } from '../../config/store'
import { deleteMeal } from '../../services/mealServices'

const ViewMeal = ({ history, match, mealData }) => {
  // handle delete button
  function handleDelete(event) {
    event.preventDefault();
    deleteMeal(meal._id).then(() => {
      console.log("deleted meal")
      const updatedMeals = meals.filter((storedMeal) => storedMeal._id !== meal._id)
      dispatch({
        type: "setMeals",
        data: updatedMeals
      })
      history.push("/")
    }).catch((err) => {
      const { status, data } = err.response || {}
      const { errorMsg } = data || {}
      if (status === 400)
        setErrorMessage(errorMsg)
      else if (status === 403)
        setErrorMessage("Oops! It appears we lost your login session. Make sure 3rd party cookies are not blocked by your browser settings.")
      else
        setErrorMessage("Well, this is embarrassing... There was a problem on the server.")
    });
    history.push(`/meals`);
  }

  // handle edit button
  function handleEdit(event) {
    event.preventDefault();
    history.push(`/meals/edit/${meal._id}`);
  }

  const { store, dispatch } = useGlobalState()
  const { meals, loggedInUser } = store
  const [errorMessage, setErrorMessage] = useState(null)

  const { id } = (match && match.params) || {}
  const meal = mealData || (id && meals && Array.isArray(meals) && meals.find((meal) => meal._id === id))
  
  const {
    title,
    description,
    mealType,
    deliversOn,
    orderStarts,
    orderEnds,
    maxOrders,
    cost
  } = meal || {};

  useEffect(() => {
    if (!meal) {
      setErrorMessage("Oops! It appears we do not have meal with that id.")
    }
  }, [meal])

  const form = (
    <>
      <Form>
        <h1>Meal Details</h1>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Title</strong></Form.Label>
          <Col lg="10">
            <Form.Control
              plaintext readOnly defaultValue={title}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Description</strong></Form.Label>
          <Col lg="12">
            <Form.Control as="textarea"
              plaintext readOnly defaultValue={description}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Meal Type</strong></Form.Label>
          <Col lg="10">
            <Form.Control
              plaintext readOnly defaultValue={mealType}
              className="text-capitalize"
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Pickup Time</strong></Form.Label>
          <Col lg="10">
            <DatePicker
              name="deliversOn"
              selected={new Date(deliversOn)}
              dateFormat="MMMM d, yyyy h:mm aa"
              readOnly
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Accepting order from</strong></Form.Label>
          <Col lg="10">
            <DatePicker
              name="deliversOn"
              selected={new Date(orderStarts)}
              dateFormat="MMMM d, yyyy h:mm aa"
              readOnly
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Order ends from</strong></Form.Label>
          <Col lg="10">
            <DatePicker
              name="deliversOn"
              selected={new Date(orderEnds)}
              dateFormat="MMMM d, yyyy h:mm aa"
              readOnly
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Max Order Quantity</strong></Form.Label>
          <Col lg="10">

            <Form.Control
              plaintext readOnly defaultValue={maxOrders}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column lg="2"><strong>Cost per meal</strong></Form.Label>
          <Col lg="10">
            <Form.Control
              plaintext readOnly defaultValue={cost}
            />
          </Col>
        </Form.Group>
      </Form>
      {
        loggedInUser && loggedInUser.role === "seller" &&
        (
          <>
            <Button variant="secondary" onClick={handleDelete} className="mr-4">Delete</Button>
            <Button variant="secondary" onClick={handleEdit}>Edit</Button>
          </>
        )
      }
    </>
  )
  const mealNotFound = (
    errorMessage &&
    <p className="text-danger mt-3">{errorMessage}</p>
  )
  return (
    <Container>
      <Row>
        <Col>
          {
            meal ? form : mealNotFound
          }
        </Col>
      </Row>
    </Container >
  );
};

export default withRouter(ViewMeal);
