'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const ItemBox = require('../component/item/box');
const { connect } = require('react-redux');
const { updateItem, fetchItemTypeCreatorTypes, fetchItemTypeFields } = require('../actions');
const { itemProp, hideFields, noEditFields } = require('../constants/item');
const { get } = require('../utils');
const { 
	getItem,
	getItemFieldValue,
	isItemFieldBeingUpdated
} = require('../state-utils');

class ItemBoxContainer extends React.Component {
	async itemUpdatedHandler(item, fieldKey, newValue) {
		await this.props.dispatch(
			updateItem(item.key, {
				[fieldKey]: newValue
			})
		);
	}

	componentWillReceiveProps(props) {
		let itemType = get(props, 'item.itemType');
		if(get(this.props, 'item.itemType') != itemType) {
			this.props.dispatch(fetchItemTypeCreatorTypes(itemType));
			this.props.dispatch(fetchItemTypeFields(itemType));
		}
	}

	render() {
		return <ItemBox 
			onSave={ this.itemUpdatedHandler.bind(this, this.props.item) }
			{ ...this.props }
		/>;
	}
}

const mapStateToProps = state => {
	const item = getItem(state);

	if(!item) {
		return {};
	}

	if(!(item.itemType in state.meta.itemTypeCreatorTypes) || 
		!(item.itemType in state.meta.itemTypeFields)) {
		return {
			item,
			isLoading: true
		};
	}

	const itemTypes = state.meta.itemTypes
		.map(it => ({
			value: it.itemType,
			label: it.localized
		}));

	const itemTypeCreatorTypes = state.meta.itemTypeCreatorTypes[item.itemType]
		.map(ct => ({
			value: ct.creatorType,
			label: ct.localized
		}));

	const fields = [
		{ field: 'itemType', localized: 'Item Type' },
		state.meta.itemTypeFields[item.itemType].find(itf => itf.field === 'title'),
		{ field: 'creators', localized: 'Creators' },
		...state.meta.itemTypeFields[item.itemType].filter(itf => itf.field !== 'title')
	].filter(e => e); //filter out undefined

	const isSmallScreen = 'lg' in state.viewport && !state.viewport.lg;
	const isEditingEnabled = !isSmallScreen || state.items.editing === item.key;

	//@TODO: Refactor
	return {
		fields: fields.map(f => ({
				options: f.field === 'itemType' ? itemTypes : null,
				key: f.field,
				label: f.localized,
				readonly: isEditingEnabled ? noEditFields.includes(f) : true,
				processing: isItemFieldBeingUpdated(f.field, state),
				value: getItemFieldValue(f.field, state)
		})).filter(f => !hideFields.includes(f.key)),
		item: item || undefined,
		creatorTypes: itemTypeCreatorTypes,
		
		//@TODO: temporary, fix this together with selectLibrary events in actions
		libraryKey: state.library.libraryKey, 
		isEditing: item && state.items.editing === item.key
	};
};

const mapDispatchToProps = dispatch => {
	return {
		dispatch
	};
};

ItemBoxContainer.propTypes = {
	creatorTypes: PropTypes.array,
	creatorTypesLoading: PropTypes.bool,
	dispatch: PropTypes.func.isRequired,
	fields: PropTypes.array,
	isEditing: PropTypes.bool,
	item: itemProp,
	libraryKey: PropTypes.string
};

module.exports = connect(
	mapStateToProps,
	mapDispatchToProps
)(ItemBoxContainer);