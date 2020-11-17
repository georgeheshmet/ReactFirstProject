import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'
import { Route} from 'react-router-dom'
import {Link} from 'react-router-dom'
import  PropTypes from 'prop-types'

const categories=[{title:"Currently Reading",value:"currentlyReading"},{title:"Want To Read",value:"wantToRead"},{title:"Read",value:"read"}  ]
class BooksApp extends React.Component {
  state = {
    /**
     * TODO: Instead of using this state variable to keep track of which page
     * we're on, use the URL in the browser's address bar. This will ensure that
     * users can use the browser's back and forward buttons to navigate between
     * pages, as well as provide a good URL they can bookmark and share.
     */
    books:[],
    
  }

  UpdateCat=(book,shelf)=>{
    BooksAPI.update(book,shelf).then(()=>(window.location.reload()))
    
    //window.location.reload();
  }
    
  componentDidMount(){
      BooksAPI.getAll().then((books)=>this.setState(()=>({books:books}))
      )
      }
  render() {
    return (
      <div className="app">
        
        <Route exact path='/search' render={({history})=>(
          <SearchWindow history={history} books={this.state.books} UpdateCat={this.UpdateCat}/>
          
        )}/>
        <Route exact path='/' render={()=>(
          <ShelvesContainer books={this.state.books}  UpdateCat={this.UpdateCat} />)}/>
       
      </div>
    )
  }
}

export default BooksApp


class Book extends React.Component {
  state = {

    BookCat:this.props.bookCategory
  }
  HandelUpdate=(book,shelf)=>{
  this.setState(()=>({BookCat:shelf}))
  // let PrevShelf=book.shelf
  this.props.UpdateCat(book,shelf) 
  // this.props.UpdateCatUI(PrevShelf,shelf)
  }
  render() {

    const book=this.props.bookitem
    //console.log(book)
    return(

      
      <div className="book">
      <div className="book-top">
        {book.imageLinks.smallThumbnail!==undefined&&
        <div className="book-cover" style={{ width: 128, height: 193, backgroundImage: `url(${book.imageLinks.smallThumbnail})` }}></div>}
        <div className="book-shelf-changer">
        <select value={this.state.BookCat} onChange={(event)=>this.HandelUpdate(book,event.target.value)}>
          <option value="move" disabled>Move to...</option>
          <option value="currentlyReading">Currently Reading</option>
          <option value="wantToRead">Want to Read</option>
          <option value="read">Read</option>
          <option value="none">None</option>
        </select>
      </div>  
      </div>
      {book.title!==undefined &&
      <div className="book-title">{book.title}</div>}
      {Array.isArray(book.authors)&&
      book.authors.map((author)=>(<div key={author} className="book-authors">{author}</div>)) }      
                
      </div>
      
                        
    

    )
  }
}
class Category extends React.Component{
state={
  CatChanged:false
}

// UpdateCatUI(oldShelv,newshelve){
//   if (this.props.category===oldShelv||this.props.category===newshelve){
//     this.setState(()=>({CatChanged:true}))
//   }
// }

  componentDidMount(){
      if(this.state.CatChanged===true){
        this.setState(()=>({CatChanged:false}))
      }
    }
  render(){
    const {books, UpdateCat,category} =this.props
    return(
<div className="bookshelf">
<h2 className="bookshelf-title">{category.title}</h2>
<div className="bookshelf-books">
  <ol className="books-grid">
    {books.filter((book)=>(book.shelf===category.value)).map((book)=>(
      <li key={book.id}>
        {/* <Book key={book.id} bookitem={book} UpdateCat={UpdateCat} bookCategory={book.shelf} UpdateCatUI={this.UpdateCatUI}/> */}
        <Book key={book.id} bookitem={book} UpdateCat={UpdateCat} bookCategory={book.shelf} />
        </li>
    ))}

  </ol>
</div>
</div>
    )
  }
}

class ShelvesContainer extends React.Component{
  static propTypes= {
    books: PropTypes.array.isRequired,
    UpdateCat: PropTypes.func.isRequired
}

  render(){
    return(
      <div className="list-books">
      <div className="list-books-title">
        <h1>MyReads</h1>
      </div>
      <div className="list-books-content">
        <div>
            {categories.map((Cat)=>(
            <Category key={Cat.value} books={this.props.books} UpdateCat={this.props.UpdateCat}  category={Cat}/>))}
        </div>
      </div>
      <div className="open-search">
          { <Link
            to='/search'
            className='add-contact'
          ><button> Add a book</button></Link> }        
      </div>
     </div>
    )
  }
}

class SearchWindow extends React.Component{
  state={
    BooksFound:[],
    query:''
  }

  getresult(value){
    BooksAPI.search(value).then((books)=>{
      this.setState((prevs)=>({BooksFound: books, query:prevs.query}))}).catch((data)=>console.log(data))
    }

  handleinput=(value)=>{

    this.setState((prev)=>({BooksFound: [], query:value}))
    console.log(`bookscurrently = ${this.state.BooksFound}`)
    if(value.trim().length>2){
      this.getresult(value)
      console.log("here baby")
    }
  }

  handlePaste=(value)=>{
    if(value.length>2){
    this.getresult()}
  }
  render(){
    const books=this.props.books
    return(
  
<div className="search-books">
            <div className="search-books-bar">
            <button><a
            href='/'
            className="close-search" 
          > Add a book</a> </button>
              {/* <button className="close-search" onClick={() => this.props.history.goBack()}>Close</button> */}
              <div className="search-books-input-wrapper">
                {/*
                  NOTES: The search from BooksAPI is limited to a particular set of search terms.
                  You can find these search terms here:
                  https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

                  However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
                  you don't find a specific author or title. Every search is limited by search terms.
                */}
                <input value={this.state.query} onPaste={(event)=>this.handlePaste(event.target.value)}onChange={(event)=>(this.handleinput(event.target.value))} type="text" placeholder="Search by title or author"/>

              </div>
            </div>
          
            <div className="search-books-results">
              <ol className="books-grid">
                  
                {Array.isArray(this.state.BooksFound)&&
                 <div>
                   {this.state.BooksFound.map((book)=>(
                    //  <li key={book.id}>{`${book.title} and  ${book.authors} and "url(${book.imageLinks.smallThumbnail})"`}</li>
                    books.filter((shelvebook)=>(shelvebook.id===book.id)).length!==0?
                    <li key={book.id}>
                  <Book   bookitem={book} bookCategory={books.filter((shelvebook)=>(shelvebook.id===book.id))[0].shelf} UpdateCat={this.props.UpdateCat}/>
                  </li>:
                  
                  <li key={book.id}><Book   bookitem={book} bookCategory={"none"} UpdateCat={this.props.UpdateCat}/></li>
                ))
                
              }
              </div>
            }
              
              </ol>
            </div>
          </div>
)

}
}