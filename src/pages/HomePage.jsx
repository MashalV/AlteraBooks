import React, { useEffect, useState, useMemo } from "react";
import "./HomePage.scss";
import axios from "axios";
import Header from "../components/Header/Header";
import Input from "../components/Input/Input";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Spinner from "../components/Spinner/Spinner";

function HomePage() {
  document.title = "AlteraBooks: Home";
  

  const navigate = useNavigate();

  const [bookOne, setBookOne] = useState([]);
  const [titleOne, setTitleOne] = useState("");
  const [titleTwo, setTitleTwo] = useState("");
  const [titleThree, setTitleThree] = useState("");
  const [bookTwo, setBookTwo] = useState([]);
  const [bookThree, setBookThree] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [subjectOneList, setSubjectOneList] = useState([]);
  const [subjectTwoList, setSubjectTwoList] = useState([]);
  const [subjectThreeList, setSubjectThreeList] = useState([]);
  const [commonSubjectList, setCommonSubjectList] = useState([]);
  const [allFetched, setAllFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dependency, setDependency] =useState(0);

  const fetchBookByTitle = async (title, setBookState) => {
    const baseURL = "https://openlibrary.org/search.json?q=";
    try {
      const response = await axios.get(
        `${baseURL}${encodeURIComponent(title)}`
      );
      // console.log(`Response for "${title}":`, response.data.docs[0].subject);
      const bookData = response.data.docs[0];
      setBookState(bookData);
    } catch (error) {
      console.error(
        "Error fetching books by subject:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const commonSubjects = (subjectO = [], subjectT = [], subjectTh = []) => {
    if (
      !Array.isArray(subjectO) ||
      !Array.isArray(subjectT) ||
      !Array.isArray(subjectTh)
    ) {
      console.error("One or more inputs are not arrays");
      return [];
    }

    let commonBetweenOneAndTwo = subjectO.filter((subject) =>
      subjectT.includes(subject)
    );
    let commonSubjects =
      subjectTh.length > 0
        ? commonBetweenOneAndTwo.filter((subject) =>
            subjectTh.includes(subject)
          )
        : commonBetweenOneAndTwo;

    // console.log(commonSubjects);
    return commonSubjects;
  };

  // add for incase one or two is empty

  const filterOutUnwantedSubjects = (subjectList) => {
   
    const unwantedKeywords = [

      "imaginary place",
      "fictitious person",
      "etc"
      
    ];
  
   
    return subjectList.filter(subject => {
      const lowerCaseSubject = subject.toLowerCase();
      const hasNumbers = /\d/.test(lowerCaseSubject);
      const hasUnwantedKeyword = unwantedKeywords.some(keyword => lowerCaseSubject.includes(keyword));
  
      return !hasNumbers && !hasUnwantedKeyword;
    });
  };

  const fetchBooksBySubjects = useMemo (() => async (
    commonSubjects,
    setListState,
    titleOne,
    titleTwo,
    titleThree
  ) => {
    const baseURL = "https://openlibrary.org/search.json?q=";
    try {
      const response = await axios.get(
        `${baseURL}${encodeURIComponent(commonSubjects)}`
      )

      let listData = response.data.docs.filter((book) => book && book.title);

      listData = listData.filter(
        (book) =>
          book.title !== titleOne &&
          book.title !== titleTwo &&
          book.title !== titleThree
      );

      // console.log(listData);
      setListState(listData.slice(0.1));

      // navigate("/results", { state: { subjectList: listData } });
    } catch (error) {
      console.error(
        "Error fetching books by subject:",
        error.response ? error.response.data : error.message
      )
    }
    }, [dependency]);
  

  const combineAndFilterRecommendations = (
    subjectOneList,
    subjectTwoList,
    subjectThreeList,
    commonList
  ) => {

    const limitPerSubject = 8;

  
    const filteredSubjectOneList = subjectOneList.filter(book => book.ratings_average >= 3).slice(0, limitPerSubject);
    const filteredSubjectTwoList = subjectTwoList.filter(book => book.ratings_average >= 3).slice(0, limitPerSubject);
    const filteredSubjectThreeList = subjectThreeList.filter(book => book.ratings_average >= 3).slice(0, limitPerSubject);
    const filteredCommonList = commonList.filter(book => book.ratings_average >= 3).slice(0, limitPerSubject);

    // console.log(commonList);
    // console.log(subjectOneList);
    // console.log(subjectTwoList);
    // console.log(subjectThreeList);
    let combinedList = [
      ...filteredCommonList,
      ...filteredSubjectOneList,
      ...filteredSubjectTwoList,
      ...filteredSubjectThreeList,
    ];
    console.log(combinedList);

    // const normalizedCombinedList = combinedList.map(book => ({
    //   ...book,
    //   title: book.title ? book.title.toLowerCase().trim() : null
    // }));

    // const filteredList = combinedList.filter(
    //   (book, index, self) =>
    //     book.title && index === self.findIndex((b) => b.title === book.title)
    // );

    // navigate("/results", { state: { subjectList: filteredList.slice(0,20) } });

    // return filteredList.slice(0, 20);

    const uniqueBooks = [];
    const titlesSet = new Set();

    combinedList.forEach((book) => {
      if (!titlesSet.has(book.title)) {
        titlesSet.add(book.title);
        uniqueBooks.push(book);
      }
    });

    return uniqueBooks.slice(0, 20);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAllFetched(true);

    try {
      await Promise.all([
        fetchBookByTitle(titleOne, setBookOne),
        fetchBookByTitle(titleTwo, setBookTwo),
        fetchBookByTitle(titleThree, setBookThree),
      ]);
    } catch (error) {
      console.error("Error during generation:", error);
    } finally {
      setLoading(false);
    }
  }
  

  useEffect(() => {
    const processBooks = async () => {
      if (bookOne && bookTwo && bookThree) {
        const subjectOne = filterOutUnwantedSubjects(bookOne.subject || []);
        const subjectTwo = filterOutUnwantedSubjects(bookTwo.subject || []);
        const subjectThree = filterOutUnwantedSubjects(bookThree.subject || []);

        // console.log(subjectOne.slice(0,4))
        // console.log(subjectTwo.slice(0,4))
        // console.log(subjectThree.slice(0,4))

        const common = commonSubjects(subjectOne, subjectTwo, subjectThree);
        const commonSubjectsLimited = common.slice(0, 10);


        try {
          if (commonSubjectsLimited.length > 2) {
            setDependency(dependency+1)
            await Promise.all([
              fetchBooksBySubjects(
                commonSubjectsLimited,
                setSubjectList,
                titleOne,
                titleTwo,
                titleThree
              ),
              fetchBooksBySubjects(
                subjectOne.slice(0, 4),
                setSubjectOneList,
                titleOne,
                titleTwo,
                titleThree
              ),
              fetchBooksBySubjects(
                subjectTwo.slice(0, 4),
                setSubjectTwoList,
                titleOne,
                titleTwo,
                titleThree
              ),
              fetchBooksBySubjects(
                subjectThree.slice(0, 4),
                setSubjectThreeList,
                titleOne,
                titleTwo,
                titleThree
              ),
            ]);
          } else {
            setDependency(dependency+1)
            await Promise.all([
              fetchBooksBySubjects(
                subjectOne.slice(0, 4),
                setSubjectOneList,
                titleOne,
                titleTwo,
                titleThree
              ),
              fetchBooksBySubjects(
                subjectTwo.slice(0, 4),
                setSubjectTwoList,
                titleOne,
                titleTwo,
                titleThree
              ),
              fetchBooksBySubjects(
                subjectThree.slice(0, 4),
                setSubjectThreeList,
                titleOne,
                titleTwo,
                titleThree
              ),
            ]);
          }
        
        } catch (error){
          console.error("Error during book processing:", error);
        }

        const finalList = combineAndFilterRecommendations(
          subjectList,
          subjectOneList,
          subjectTwoList,
          subjectThreeList
        );
        console.log(finalList);

        setSubjectList(finalList);
        setAllFetched(true);
        navigate("/results", { state: { subjectList: finalList } });
      }
    
  }

    if (!loading && bookOne && bookTwo && bookThree) {
      processBooks();
      }
    }
  , [
    bookOne,
    bookTwo,
    bookThree,
    loading,
    subjectOneList,
    subjectTwoList,
    subjectThreeList,
    navigate,
    setAllFetched, 
    allFetched
  ]);

  //to-do list
  // only take the first three subjects when querying

  return (
    <div className="wrapper">

    {allFetched ? (
            <Spinner /> // Display spinner when loading
          ) : ( 
         <>
      <main>
        <Header />
        <Input
          setTitleOne={setTitleOne}
          setTitleTwo={setTitleTwo}
          setTitleThree={setTitleThree}
          onGenerate={handleGenerate}
        />
      </main>
      <Footer />

       </>
          )} 
    </div>
  );
}

export default HomePage;