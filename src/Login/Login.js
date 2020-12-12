import React, { useState } from 'react';
import './Login.css';
import { withRouter } from "react-router-dom";

function LoginForm(props) {
    const swapiURL = "https://swapi.dev/api/people/?search=";
    const [state, setState] = useState({
        username: "",
        password: "",
        failureMessage: false
    })

    // As I was using Hooks, kept the ajax call here, Ideally should be in Service folder.
    async function getPlanets() {
        const { username, password } = state;
        try {
            const response = await fetch(swapiURL + username.trim())
            const people = await response.json();
            const { results = [] } = people || {};

            if (results.length === 1) { // if length is 0 or more than 1, means username is not exact match
                const { name, birth_year } = results[0] || {};
                if (name === username && birth_year === password) {
                    redirectToSearch();
                    return;
                }
            }
            setState((prevState) => ({
                ...prevState,
                failureMessage: true
            }));
        } catch (e) {
            console.log("error");
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setState(prevState => ({
            ...prevState,
            [name]: value
        }))
    }
    const handleSubmitClick = (e) => {
        e.preventDefault();
        const { username, password } = state;
        if (username && password) {
            getPlanets();
        }
    }
    const redirectToSearch = () => {
        props.history.push('/Search',state.username);
    }
    return (
        <div className="container">
            <form>
                <h1>Sign in</h1>
                <div className="form-content">
                    <input
                        name="username"
                        type="text"
                        placeholder="Enter username"
                        value={state.username}
                        onChange={handleChange}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={state.password}
                        onChange={handleChange}
                    />
                    <br />
                    <button
                        className="button"
                        type="submit"
                        onClick={handleSubmitClick}
                    >Submit</button>
                    <br />
                    <div style={{ display: state.failureMessage ? 'block' : 'none' }} role="alert">
                        Invalid Login Details
                    </div>
                </div>
            </form>
        </div>
    )
}

export default withRouter(LoginForm);