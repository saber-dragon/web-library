'use strict';

import React from 'react';
import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';

class NoteEditor extends React.Component {
	render() {
		let RichEditor = this.props.components['RichEditor'];

		return (
			<div className="note-editor">
				<ul className="note-editor-list">
					{
						this.props.notes.map(note => {
							return (
								<li 
									className="note-editor-item"
									onClick={ ev => this.editHandler(note, ev) }
								>
									{ note.title }
								</li>
							);
						})
					}
				</ul>
				<div className="note-editor-editor">
					<RichEditor value="" />
				</div>
			</div>
		);
	}
}

NoteEditor.propTypes = {
	notes: React.PropTypes.array
};

NoteEditor.defaultProps = {
	notes: []
};

export default InjectableComponentsEnhance(NoteEditor);
