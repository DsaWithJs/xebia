import React, { useState, useEffect, useRef, Fragment } from 'react'
import { withRouter } from "react-router-dom";
import { sortBy } from "lodash";

import "./Search.css"

function Search(props) {

    const swapiURL = "https://swapi.dev/api/planets/?search=";
    const maxCount = 15;
    const [search, setSearch] = useState("")
    const [results, setResults] = useState([])
    const [searchCount, setSearchCount] = useState(0)
    const isFirstRun = useRef(true);
    const { location: { state: username } } = props;
    const isAdmin = useRef(username === "Luke Skywalker");
    const debouncedSearchTerm = useDebounce(search, 250);

    useEffect(function () {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        async function getPlanets() {
            try {
                const response = await fetch(swapiURL + debouncedSearchTerm)
                const plants = await response.json();
                const { results = [] } = plants || {};
                setResults(results);
                setSearchCount((prevState) => ++prevState);
            } catch (e) {
                console.log("error");
            }
        }
        getPlanets();
    }, [debouncedSearchTerm, swapiURL]);

    useEffect(() => {
        if (!isAdmin.current) {
            const interval = setInterval(() => {
                setSearchCount(0);
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [isAdmin]);

    const handleChange = (e) => {
        const { value } = e.target
        setSearch(value)
    }
    const goBack = () => {
        props.history.replace("/login")
    }

    return (
        <Fragment>
            <div className="loginDetails">
                <p className="username">User name:{username}</p>
                <button className="logout" onClick={goBack}>Logout </button>
            </div>
            <div className="search">
                <h1 >Planets with Populaton</h1>
                <input
                    className="searchTerm"
                    placeholder="Search for planets..."
                    value={search}
                    onChange={handleChange}
                    disabled={!isAdmin.current && (searchCount >= maxCount)}
                />
                <div>
                    {isAdmin.current || searchCount < maxCount
                        ? <p>Number of Searchs: {searchCount}</p>
                        : <span>Wait for some time,exceeded 15 limit </span>}
                </div>
                <br />
            </div>
            <p className="searchItems">Search Term: {debouncedSearchTerm}</p>
            <Suggestions results={results} />
        </Fragment>
    );
}

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(
        () => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay]
    );
    return debouncedValue;
}

const Suggestions = ({ results }) => {
    const resultsByPopulation = sortBy(results, [function ({ population }) {
        if (isNaN(population)) {
            return 0;
        }
        return -population * 1;
    }]);
    const options = resultsByPopulation.map(r => (
        <tr key={r.name}>
            <td >
                {r.name}
            </td >
            <td >
                {r.population}
            </td >
        </tr>
    ))

    return (
        <div>
            <table id='planets'>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Populaton</th>
                    </tr>
                    {options}
                </tbody>
            </table>
            <br />
            <div className="noResults" style={{ display: !resultsByPopulation.length ? 'block' : 'none' }} role="alert">
                No Results Found
            </div>
        </div>
    )
}

export default withRouter(Search)
