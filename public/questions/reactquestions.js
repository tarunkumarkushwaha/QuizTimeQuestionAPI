let reactquestions = {
    time: 20, //in minutes
    questions: [{
        question: "What is useeffect in react?",
        option1: "a react hook",
        option2: "function to set visual effects in react",
        option3: "what is react",
        option4: "a react key",
        correctresponse: "a react hook",
        time: 1
    },
    {
        question: "What is the purpose of useEffect?",
        option1: "To perform side effects in functional components",
        option2: "To define the structure of a component",
        option3: "To render the component",
        option4: "To create reusable UI components",
        correctresponse: "To perform side effects in functional components",
        time: 1
    },
    {
        question: "What are some common side effects that can be handled with useEffect?",
        option1: "Fetching data from an API",
        option2: "Subscribing to events",
        option3: "Manipulating the DOM",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },
    {
        question: "How does useEffect work?",
        option1: "It executes after every render",
        option2: "It executes only once after the initial render",
        option3: "It executes only when the component mounts",
        option4: "It executes only when the component unmounts",
        correctresponse: "It executes after every render",
        time: 1
    },
    {
        question: "How can you control when useEffect runs?",
        option1: "By using the dependency array",
        option2: "By using the useEffect hook within a conditional statement",
        option3: "By using the useRef hook",
        option4: "By using the useCallback hook",
        correctresponse: "By using the dependency array",
        time: 1
    },
    {
        question: "What happens when you include a value in the dependency array?",
        option1: "useEffect will run only once",
        option2: "useEffect will run whenever that value changes",
        option3: "useEffect will never run",
        option4: "useEffect will run only when the component mounts",
        correctresponse: "useEffect will run whenever that value changes",
        time: 1
    },
    {
        question: "What is the purpose of the empty dependency array ([]) in useEffect?",
        option1: "To prevent useEffect from running on every render",
        option2: "To ensure useEffect runs only once after the initial render",
        option3: "To prevent useEffect from running at all",
        option4: "To make useEffect run on every render",
        correctresponse: "To ensure useEffect runs only once after the initial render",
        time: 1
    },
    {
        question: "What is the cleanup function in useEffect?",
        option1: "A function that is executed before the component unmounts",
        option2: "A function that is executed before the component mounts",
        option3: "A function that is executed on every render",
        option4: "A function that is used to update the state",
        correctresponse: "A function that is executed before the component unmounts",
        time: 1
    },
    {
        question: "What is the purpose of the cleanup function?",
        option1: "To clean up any side effects created by useEffect",
        option2: "To prevent memory leaks",
        option3: "To cancel subscriptions or timers",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },
    {
        question: " How do you access the previous props or state within useEffect?",
        option1: "Using the useRef hook",
        option2: "Using the useCallback hook",
        option3: "Using the useState hook",
        option4: "Using the previousProps and previousState arguments",
        correctresponse: "Using the useRef hook",
        time: 1
    },
    {
        question: " What is the difference between useEffect and useState?",
        option1: "useEffect is used for side effects, useState is used to manage state",
        option2: "useEffect is used to manage state, useState is used for side effects",
        option3: "They both are used for the same purpose",
        option4: "There is no difference between them",
        correctresponse: "useEffect is used for side effects, useState is used to manage state",
        time: 1
    },
    {
        question: " Can you use multiple useEffect hooks in a single component?",
        option1: "Yes",
        option2: "No",
        option3: "Only in certain cases",
        option4: "It depends on the complexity of the component",
        correctresponse: "Yes",
        time: 1
    },
    {
        question: " What is the importance of optimizing useEffect?",
        option1: "To improve performance",
        option2: "To prevent memory leaks",
        option3: "To make the code more readable",
        option4: "To avoid unnecessary re-renders",
        correctresponse: "To improve performance and prevent memory leaks",
        time: 1
    },
    {
        question: " How can you optimize useEffect?",
        option1: "By using the dependency array correctly",
        option2: "By avoiding unnecessary side effects",
        option3: "By using the cleanup function effectively",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },
    {
        question: " What is the relationship between useEffect and the component lifecycle?",
        option1: "useEffect is closely tied to the component lifecycle",
        option2: "useEffect has no relation to the component lifecycle",
        option3: "useEffect is only used during the mounting phase",
        option4: "useEffect is only used during the unmounting phase",
        correctresponse: "useEffect is closely tied to the component lifecycle",
        time: 1
    },
    {
        question: " Can you use useEffect in class components?",
        option1: "Yes, using the componentDidMount, componentDidUpdate, and componentWillUnmount lifecycle methods",
        option2: "No, useEffect is only available in functional components",
        option3: "Yes, using the render method",
        option4: "Yes, using the constructor method",
        correctresponse: "Yes, using the componentDidMount, componentDidUpdate, and componentWillUnmount lifecycle methods",
        time: 1
    },
    {
        question: " What is the advantage of using useEffect over traditional class component lifecycle methods?",
        option1: "It provides a more concise and declarative way to handle side effects",
        option2: "It makes the code more reusable and easier to test",
        option3: "It improves performance and reduces complexity",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },
    {
        question: " What is a common anti-pattern when using useEffect?",
        option1: "Including unnecessary dependencies in the dependency array",
        option2: "Forgetting to include necessary dependencies in the dependency array",
        option3: "Using useEffect for every state or prop change",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },
    {
        question: " What is the best practice for optimizing useEffect?",
        option1: "Think carefully about which values should be included in the dependency array",
        option2: "Use the cleanup function to avoid memory leaks",
        option3: "Avoid unnecessary side effects within useEffect",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },
    {
        question: " How can you debug useEffect issues?",
        option1: "By using the browser's developer tools",
        option2: "By logging values to the console",
        option3: "By using a debugger",
        option4: "All of the above",
        correctresponse: "All of the above",
        time: 1
    },]
}

module.exports =  reactquestions