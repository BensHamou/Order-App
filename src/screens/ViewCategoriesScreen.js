import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  Grid,
  List,
  ListItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { Store } from "../Store";
import Image from "material-ui-image";
import { listACategories } from "../actions";
import { Add, ArrowRight } from "@material-ui/icons";
import Logo from "../components/Logo";
import { Alert } from "@material-ui/lab";
import { useStyles } from "../styles";
import FileBase from "react-file-base64";
import axios from "axios";
import { Helmet } from "react-helmet";

const initialState = {
  name: "",
  image: "/images/empty.png",
};

const ViewCategoriesScreen = (props) => {
  const styles = useStyles();
  const { state, dispatch } = useContext(Store);

  const { categories, loading, error } = state.categoryList;
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(initialState);
  const [isNew, setIsNew] = useState(false);

  const closeHandler = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!categories) listACategories(dispatch);
  }, [dispatch, categories]);

  const categoryClickHandler = (c) => {
    setCategory(c);
    setIsNew(false);
    setIsOpen(true);
  };

  const cancelChange = () => {
    setCategory({});
    setIsNew(false);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await axios.put("/api/categories/" + category._id, {
        name: category.name,
        image: category.image,
      });
      listACategories(dispatch);
      setIsOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post("/api/categories/", category);
      listACategories(dispatch);
      setIsOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteHandler = async (c) => {
    try {
      await axios.delete("/api/categories/" + c._id);
      listACategories(dispatch);
    } catch (error) {
      alert(error.message);
    }
  };

  const addCategoryHandler = async () => {
    setCategory(initialState);
    setIsNew(true);
    setIsOpen(true);
  };

  return (
    <Grid container>
      <Helmet>
        <title>View Categories</title>
      </Helmet>
      <Dialog
        onClose={closeHandler}
        aria-labelledby="max-width-dialog-title"
        open={isOpen}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle className={styles.center}>
          {isNew ? "New Category" : `Edit ${category.name}`}
        </DialogTitle>
        <Grid container>
          <Grid item md={6}>
            <Box className={[styles.row, styles.center]}>
              <TextField
                name="name"
                label="Name"
                value={category.name}
                onChange={(e) =>
                  setCategory({ ...category, name: e.target.value })
                }
                type="text"
              />
            </Box>
          </Grid>
          <Grid item md={6}>
            <Box>
              <Image src={category.image} alt={category.name} />
            </Box>
            <Box>
              <FileBase
                type="file"
                multiple={false}
                onDone={({ base64 }) =>
                  setCategory({ ...category, image: base64 })
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
              <ListItem className={styles.center}>
                <Logo large></Logo>
              </ListItem>
              <ListItem
                button
                style={{ marginTop: "31vh" }}
                className={styles.center}
                onClick={addCategoryHandler}
              >
                <Typography
                  component="h6"
                  variant="h6"
                  className={styles.center}
                >
                  Add Category
                  <Add
                    className={styles.center}
                    style={{ marginLeft: "1vh" }}
                  />
                </Typography>
              </ListItem>
              <ListItem
                button
                className={styles.center}
                onClick={() => props.history.push("/view-product")}
              >
                <Typography
                  component="h6"
                  variant="h6"
                  className={styles.center}
                >
                  View Products
                  <ArrowRight className={styles.center} />
                </Typography>
              </ListItem>
            </>
          )}
        </List>
      </Grid>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid item md={10}>
          <Box>
            <Box>
              <TableContainer component={Paper}>
                <Table aria-label="Orders">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Name</TableCell>
                      <TableCell align="center">Image</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories?.map((category) => (
                      <TableRow key={category._id}>
                        <TableCell align="center">{category.name}</TableCell>
                        <TableCell align="center">
                          <Image src={category.image} alt={category.name} />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            onClick={() => categoryClickHandler(category)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => deleteHandler(category)}
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

export default ViewCategoriesScreen;
