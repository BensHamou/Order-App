import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Grid,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  Link,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { Store } from "../Store";
import Image from "material-ui-image";
import { listCategories, listAProducts } from "../actions";
import { Add } from "@material-ui/icons";
import { ArrowRight } from "@material-ui/icons";
import Logo from "../components/Logo";
import { Alert } from "@material-ui/lab";
import { useStyles } from "../styles";
import FileBase from "react-file-base64";
import axios from "axios";
import { Helmet } from "react-helmet";

const initialState = {
  name: "",
  image: "/images/empty.png",
  price: 0,
  calorie: 0,
  category: "Beverages",
};

const ViewProductsScreen = (props) => {
  const styles = useStyles();
  const { state, dispatch } = useContext(Store);

  const { categories, loading, error } = state.categoryList;
  const {
    products,
    loading: loadingProducts,
    error: errorProducts,
  } = state.productList;
  const [categoryName, setCategoryName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState(initialState);
  const [isNew, setIsNew] = useState(false);
  const closeHandler = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    if (!categories) {
      listCategories(dispatch);
    } else {
      listAProducts(dispatch, categoryName);
    }
  }, [dispatch, categories, categoryName]);

  const categoryClickHandler = (name) => {
    setCategoryName(name);
    listAProducts(dispatch, categoryName);
  };
  const productClickHandler = (p) => {
    setProduct(p);
    setIsNew(false);
    setIsOpen(true);
  };

  const cancelChange = () => {
    setProduct({});
    setIsNew(false);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.put("/api/products/" + product._id, {
        name: product.name,
        image: product.image,
        category: product.category,
        calorie: product.calorie,
        price: product.price,
      });
      listAProducts(dispatch, categoryName);
      setIsOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAvailable = async (id) => {
    try {
      await axios.put("/api/products/available/" + id);
      listAProducts(dispatch, categoryName);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post("/api/products/", product);
      listAProducts(dispatch, categoryName);
      setIsOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteHandler = async (p) => {
    try {
      await axios.delete("/api/products/" + p._id);
      listAProducts(dispatch, categoryName);
    } catch (error) {
      alert(error.message);
    }
  };

  const addProductHandler = async () => {
    setProduct(initialState);
    setIsNew(true);
    setIsOpen(true);
  };

  return (
    <Grid container>
      <Helmet>
        <title>View Products</title>
      </Helmet>
      <Dialog
        onClose={closeHandler}
        aria-labelledby="max-width-dialog-title"
        open={isOpen}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle className={styles.center}>
          {isNew ? "New Product" : `Edit ${product.name}`}
        </DialogTitle>
        <Grid container>
          <Grid item md={6}>
            <Box className={[styles.row, styles.center]}>
              <TextField
                name="name"
                label="Name"
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
                type="text"
              />
            </Box>
            <Box className={[styles.row, styles.center]}>
              <TextField
                name="price"
                label="Price"
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: e.target.value })
                }
                type="text"
              />
            </Box>
            <Box className={[styles.row, styles.center]}>
              <TextField
                name="calorie"
                label="Calories"
                value={product.calorie}
                onChange={(e) =>
                  setProduct({ ...product, calorie: e.target.value })
                }
                type="text"
              />
            </Box>
            <Box className={[styles.row, styles.center]}>
              <Select
                fullWidth
                value={product.category}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
                }
              >
                {categories?.map((category) => (
                  <MenuItem value={category.name}>{category.name}</MenuItem>
                ))}
              </Select>
            </Box>
          </Grid>
          <Grid item md={6}>
            <Box>
              <Image src={product.image} alt={product.name} />
            </Box>
            <Box>
              <FileBase
                type="file"
                multiple={false}
                onDone={({ base64 }) =>
                  setProduct({ ...product, image: base64 })
                }
              />
            </Box>
          </Grid>
        </Grid>
        <Box className={[styles.row, styles.around]}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={cancelChange}
            className={styles.largeButton}
          >
            Cancel
          </Button>
          {isNew ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleCreate}
              className={styles.largeButton}
            >
              Add
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              className={styles.largeButton}
            >
              Submit
            </Button>
          )}
        </Box>
      </Dialog>
      <Grid item md={2}>
        <List>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <>
              <ListItem
                button
                className={styles.center}
                onClick={() => categoryClickHandler("")}
              >
                <Logo></Logo>
              </ListItem>
              {categories.map((category) => (
                <ListItem
                  className={styles.center}
                  key={category.name}
                  button
                  onClick={() => categoryClickHandler(category.name)}
                >
                  <Avatar alt={category.name} src={category.image} />
                </ListItem>
              ))}
              <ListItem
                button
                className={styles.center}
                style={{ marginTop: "10vh" }}
                onClick={addProductHandler}
              >
                <Typography
                  component="h6"
                  variant="h6"
                  className={styles.center}
                >
                  Add Product
                  <Add className={styles.center} style={{ marginLeft: 10 }} />
                </Typography>
              </ListItem>
              <ListItem
                button
                className={styles.center}
                onClick={() => props.history.push("/view-category")}
              >
                <Typography
                  component="h6"
                  className={styles.center}
                  variant="h6"
                >
                  View Categories
                  <ArrowRight className={styles.center} />
                </Typography>
              </ListItem>
            </>
          )}
        </List>
      </Grid>
      {loadingProducts ? (
        <CircularProgress />
      ) : errorProducts ? (
        <Alert severity="error">{errorProducts}</Alert>
      ) : (
        <Grid item md={10}>
          <Box>
            <Box>
              <TableContainer component={Paper}>
                <Table aria-label="Orders">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Price</TableCell>
                      <TableCell align="center">Calories</TableCell>
                      <TableCell align="center">Category</TableCell>
                      <TableCell align="center">Avalaible</TableCell>
                      <TableCell align="center">Image</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell align="center">{product.name}</TableCell>
                        <TableCell align="center">{product.price}$</TableCell>
                        <TableCell align="center">
                          {product.calorie} Cal
                        </TableCell>
                        <TableCell align="center">{product.category}</TableCell>
                        <TableCell
                          align="center"
                          color="primary"
                          onClick={() => handleAvailable(product._id)}
                        >
                          <Link
                            href=""
                            underline="none"
                            style={
                              product.isAvalaible
                                ? { color: "green" }
                                : { color: "red" }
                            }
                          >
                            {product.isAvalaible ? "Yes" : "No"}
                          </Link>
                        </TableCell>
                        <TableCell align="center">
                          <Image src={product.image} alt={product.name} />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            onClick={() => productClickHandler(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => deleteHandler(product)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default ViewProductsScreen;
