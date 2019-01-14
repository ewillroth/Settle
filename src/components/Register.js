import React, { Component } from 'react';
import {connect} from 'react-redux';
import Header from './Header';
import {updateName, updateEmail, updatePassword, resetForm} from '../redux/reducers/userReducer';
import axios from 'axios';

class Register extends Component {

	onSubmit = (e) => {
		e.preventDefault()
		const { email, name, password } = this.props
		axios.post('/auth/register', { email, name, password })
		.then((response) => {
			this.props.resetForm(response)
			this.props.history.push('/dashboard')
		})
		.catch(err => { alert(err.response.request.response) })
	}

	render() {
		return (
			<>
			<Header/>
			<form className="register" onSubmit={this.onSubmit}>
				<p>Name</p>
				<input onChange={(e)=>this.props.updateName(e.target.value)} value={this.props.name}></input>
				<p>Email</p>
				<input onChange={(e)=>this.props.updateEmail(e.target.value)} value={this.props.email}></input>
				<p>Password</p>
				<input onChange={(e)=>this.props.updatePassword(e.target.value)} value={this.props.password}></input>
				<button>Submit</button>
			</form>
			</>
		)
	}
}
const mapStateToProps = (state) => {
	return {
		name: state.userRdcr.name,
		email: state.userRdcr.email,
		password: state.userRdcr.password
	}
}

export default connect(mapStateToProps, {updateName,updateEmail, updatePassword, resetForm})(Register);