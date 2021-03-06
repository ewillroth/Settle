import React, {Component} from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom'
import {getParticipants} from '../../../redux/reducers/settleReducer';
import {getUser} from '../../../redux/reducers/userReducer';
import Participants from '../Inactive/Participants';
import Header from '../../Header';

class Active extends Component{
	constructor(props){
		super(props)
		this.state={
			suggestions: [],
			activeuser: '',
			redirect: false,
			loaded: false,
			update: false
		}
	}
	componentDidMount(){
		const {socket} = this.props
		socket && socket.on('suggestion_removed', ()=>{
			console.log("Socket: suggestion removed")
			this.setState({update:!this.state.update})
		})
		//gets user from session
		this.props.getUser()
		.then(()=>{
			this.props.getParticipants(this.props.id)
			.then(()=>{
				//checks if the user is in the settle before loading or redirecting
				if(this.props.participants.find(e=>e.user_id === this.props.user.user_id)){
					this.setState({
						loaded: true
					})
				}else{
					this.setState({
						redirect: true
					})
				}
			})
			.catch(err=>console.log(err))
		})
		.catch(err => console.log(err))

		//gets suggestions and makes the list
		axios.get(`/api/settle/${this.props.id}/suggestions`)
		.then(response=>{
			let arr = response.data
			let suggestions = []
			arr.forEach((e,i)=>{suggestions.push(e.suggestion)})
			this.setState({suggestions})
		})
		.catch(err=>console.log(err))
		//gets the settle information to determine the starting player
		axios.get(`/api/settle/${this.props.id}`)
		.then(response=>{
			this.setState({activeuser: response.data.active_user})
		})
		.catch(err=>console.log(err))
	}

	componentDidUpdate(prevProps, prevState){
		if(this.state.update!==prevState.update){
			axios.get(`/api/settle/${this.props.id}/suggestions`)
				.then(response => {
					let arr = response.data
					let suggestions = []
					arr.forEach((e, i) => { suggestions.push(e.suggestion) })
					this.setState({ suggestions })
				})
				.catch(err => console.log(err))
			axios.get(`/api/settle/${this.props.id}`)
				.then(response => {
					this.setState({ activeuser: response.data.active_user })
				})
				.catch(err => console.log(err))
		}
	}

	removeSuggestion = (e) => {
		const {socket} = this.props
		axios.put(`/api/settle/${this.props.id}/remove`, {suggestion: e, activeuser: this.state.activeuser})
		.then(response=>{
			socket.emit('suggestion_removed', {room:this.props.id})
			axios.get(`/api/settle/${this.props.id}/suggestions`)
				.then(response => {
					//changes stage to complete if there is only one suggestion remaining
					if(response.data.length===1){
						axios.put(`/api/settle/${this.props.id}/stage`, { status: 'completed' })
							.then(() => {
								this.props.changeStage('completed')
							})
							.catch(err => console.log(err))
					} else {
						let arr = response.data
						let suggestions = []
						arr.forEach((e, i) => { suggestions.push(e.suggestion) })
						this.setState({ suggestions })
					}
				})
				.catch(err => console.log(err))
			this.setState({activeuser:response.data})
		})
		.catch(err=>console.log(err))
	}

	render(){
		const list = this.state.suggestions.map((e, i) => { 
			return (
				<div className="listitem" key={i}>
					<p>{e}</p>
					<button className={this.state.activeuser === this.props.user.user_id ? 'removesuggestion' : 'hide'} onClick={() => this.removeSuggestion(e)}><img src="https://firebasestorage.googleapis.com/v0/b/settle-io.appspot.com/o/images%2Ficons%2Fbackspace-arrow.png?alt=media&token=55eb66ee-6b56-48bf-b866-ac04bedb077d" alt="delete" /></button>
				</div>
			)
		})
		return (
			this.state.redirect ? <Redirect to="/" /> :
			!this.state.loaded?<></>:
			<div className="active">
				<Header/>
					<div>
						{this.props.user.name !== 'guest'
						?
						<>
							<img className="userimage" src={this.props.user.profilepic} alt="profile"></img>
							<p>{this.props.user.name}</p>
						</>
						:
						<></>
						}
					</div>
				<div className="thelist">
						{list}
				</div>
				<Participants stage="active" id={this.props.id}/>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		user: state.userRdcr.user,
		participants: state.settleRdcr.participants
	}
}

export default connect(mapStateToProps, { getUser, getParticipants })(Active);