import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { updateNotes } from '../../../Action/notesAction';
import { listUsers } from '../../../Action/userAction';

function SharedWithBox({ setVisible }) {
	const dispatch = useDispatch();
	const id = useParams().id;

	// all the users in the database
	const [allUserList, setAllUserList] = useState([]);

	// users with whom this note is shared
	const [sharedWithUserList, setSharedWithUserList] = useState([]);

	// state to decide if user is sharing notes globally
	const [global, setGlobal] = useState(false);

	// state to decide the input value
	const [inputValue, setInputValue] = useState('');

	// states for user list
	const {
		loading: userListLoading,
		userList,
		error
	} = useSelector((state) => state['userList']);

	// reducer to deal with updating note
	const {
		loading: updateLoading,
		success,
		error: updateError
	} = useSelector((state) => state['notesUpdate']);

	// notesDetail from the store
	const { loading, notesDetail } = useSelector(
		(state) => state['notesDetail']
	);

	// get list of user as soon as soon as component is rendered
	useEffect(() => {
		dispatch(listUsers());
	}, []);

	// once done loading update the shared with user list and global file
	useEffect(() => {
		setSharedWithUserList(notesDetail?.shared_with);
		setGlobal(notesDetail?.global_file);
	}, [loading, notesDetail]);

	// update the userlist after data has been fetched from backend
	useEffect(() => {
		setAllUserList(userList);
	}, [userList, userListLoading]);

	// filter all user based on the value in input box
	useEffect(() => {
		setAllUserList(
			userList.filter((user) => user.username.includes(inputValue))
		);
	}, [inputValue]);

	// this function deals with adding a user to shared_with list
	const handleAdd = (username) => {
		// put the new username and sharedWithUserList in a set to avoid identical value
		setSharedWithUserList([...new Set([...sharedWithUserList, username])]);
	};

	// deals with removing a user from the shared_with list
	const handleRemove = (username) => {
		setSharedWithUserList(
			sharedWithUserList.filter((user) => user !== username)
		);
	};

	// update the new data in backend once the user hit save
	const handleSave = () => {
		// if the owner set this to global then return global file as true and shared_with empty
		// else return the new shared_with user list
		const updateData = global
			? { global_file: true, shared_with: [] }
			: { global_file: false, shared_with: sharedWithUserList };
		dispatch(updateNotes(id, updateData));
	};

	// close the customization box when updated successfully
	useEffect(() => {
		if (success) {
			setVisible(false);
		}
	}, [success]);

	return (
		<div className="shared-box-wrapper">
			<div className="shared-box-container">
				<h2>Share</h2>
				<div className="shared-box-all-user">
					{/*Input box to filter the user */}
					<MDBInput
						label="Search User"
						onChange={(e) => setInputValue(e.target.value)}
						value={inputValue}
					/>

					{/* Displaying the list of user in database */}
					<div className="shared-box-users">
						{allUserList.map((user) => (
							<UserDisplay
								{...user}
								key={user.id}
								handleAdd={handleAdd}
							/>
						))}
					</div>
				</div>
				<h5>Shared With</h5>
				<div className="shared-box-shared-user-box">
					{/* Displaying the shared_with user with ❌ sign to remove them */}
					{sharedWithUserList.map((user) => (
						<div className="shared-box-shared-user" key={user}>
							<div>{user}</div>
							<div
								style={{ cursor: 'pointer' }}
								onClick={() => handleRemove(user)}
							>
								❌
							</div>
						</div>
					))}
				</div>
				<div className="shared-box-optns">
					{/* A checkbox to make the note Global */}
					<div class="custom-control custom-switch shared-box-switch">
						<input
							type="checkbox"
							defaultChecked={global}
							onChange={() => setGlobal(!global)}
							className="custom-control-input"
							id="customSwitches"
						/>
						<label
							className="custom-control-label"
							for="customSwitches"
						>
							Global
						</label>
					</div>
					{/* Buttons to cancel and save */}
					<div className="share-box-nav-btns">
						<div onClick={() => setVisible(false)}>Cancel</div>
						<div onClick={handleSave}>Save</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SharedWithBox;
