var xtend = require('xtend/mutable')
var React = require('react/addons')
var UI = require('./ui')

var DEFAULT_TRANSITION = 'none'
var TRANSITIONS = {
	'none': { in: false, out: false },
	'fade': { in: true, out: true },
	'fade-contract': { in: true, out: true },
	'fade-expand': { in: true, out: true },
	'show-from-left': { in: true, out: true },
	'show-from-right': { in: true, out: true },
	'show-from-top': { in: true, out: true },
	'show-from-bottom': { in: true, out: true },
	'reveal-from-left': { in: true, out: true },
	'reveal-from-right': { in: true, out: true },
	'reveal-from-top': { in: false, out: true },
	'reveal-from-bottom': { in: false, out: true }
}

/**
 * Touchstone App
 * ==============
 *
 * This function should be called with your app's views.
 *
 * It returns a Mixin which should be added to your App.
 */
function createApp(views) {
	return {
		componentWillMount: function() {
			this.views = {}

			for (var viewName in views) {
				var view = views[viewName]

				this.views[viewName] = React.createElement(view, { app: this })
			}
		},

		childContextTypes: {
			currentView: React.PropTypes.string,
			app: React.PropTypes.object.isRequired
		},

		getChildContext: function() {
			return {
				currentView: this.state.currentView,
				app: this
			}
		},

		getCurrentView: function() {
			var key = this.state.currentView
			var view = views[key]
			if (!view) return this.getViewNotFound()

			var viewProps = xtend({
				app: this,
				key: key
			}, this.state.__viewProps)

			if (this.getViewProps) {
				xtend(viewProps, this.getViewProps())
			}

			return React.createElement(view, viewProps)
		},

		getInitialState: function() {
			return {
				viewTransition: this.getViewTransition(DEFAULT_TRANSITION)
			}
		},

		getViewNotFound: function() {
			return (
				<UI.FlexLayout className="view">
					<UI.FlexBlock>
						<UI.Feedback
							iconKey="ion-alert-circled"
							iconType="danger"
							text={'Sorry, the view <strong>"' + this.state.currentView + '"</strong> is not available.'}
							actionText="Okay, take me home"
							actionFn={this.gotoDefaultView}
						/>
					</UI.FlexBlock>
				</UI.FlexLayout>
			)
		},

		getViewTransition: function(key) {
			if (!TRANSITIONS[key]) {
				console.log('Invalid View Transition: ' + key)
				key = 'none'
			}

			return xtend({
				key: key,
				name: 'view-transition-' + key,
				in: false,
				out: false
			}, TRANSITIONS[key])
		},

		showView: function(key, transition, props, state) {
			if (typeof transition === 'object') {
				props = transition
				transition = DEFAULT_TRANSITION
			}

			if (typeof transition !== 'string') {
				transition = DEFAULT_TRANSITION
			}

			console.log('Showing view |' + key + '| with transition |' + transition.key + '| and props ' + JSON.stringify(props))

			var newState = xtend({
				currentView: key,
				viewTransition: this.getViewTransition(transition),
				__viewProps: props
			}, state)

			this.setState(newState)
		}
	}
}

module.exports = createApp
