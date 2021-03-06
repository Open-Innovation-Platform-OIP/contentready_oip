# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "contentready_oip"
app_title = "ContentReady OIP"
app_publisher = "ContentReady"
app_description = "Open Innovation Platform"
app_icon = "octicon octicon-file-directory"
app_color = "grey"
app_email = "hello@contentready.co"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/contentready_oip/css/contentready_oip.css"
# app_include_js = "/assets/contentready_oip/js/contentready_oip.js"

# include js, css files in header of web template
# web_include_css = "/assets/contentready_oip/css/contentready_oip.css"
web_include_css = ["/assets/contentready_oip/css/global.css", "/assets/contentready_oip/css/alert.css", "/assets/contentready_oip/css/theme.css",]
web_include_js = ["/assets/contentready_oip/js/anchorme.min.js","/assets/frappe/node_modules/vue/dist/vue.js"]

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
home_page = "home"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "contentready_oip.utils.get_home_page"

# Generators
# ----------

# runs after login
on_session_creation = [
   "contentready_oip.api.create_user_profile_if_missing",
]

# automatically create page for each record of this doctype
website_generators = ["Web Page", "Problem"]

# Served when path provided by user cannot be resolved.
website_catch_all = [ home_page ]

# Installation
# ------------

# before_install = "contentready_oip.install.before_install"
after_install = "contentready_oip.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "contentready_oip.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"User": {
		"after_insert": "contentready_oip.api.create_profile_from_user",
		"on_update": "contentready_oip.api.create_profile_from_user",
	},
	"OIP White Label Domain": {
		"after_insert": "contentready_oip.api.setup_domain_hook",
	},
	"Problem":{
		"on_update": "contentready_oip.api.index_document",
		"on_trash": "contentready_oip.api.index_document"
	},
	"Solution":{
		"on_update": "contentready_oip.api.index_document",
		"on_trash": "contentready_oip.api.index_document"
	},
	"User Profile":{
		"on_update": "contentready_oip.api.index_document",
		"on_trash": "contentready_oip.api.index_document"
	},
	"Organisation": {
		"on_update": "contentready_oip.api.index_document",
		"on_trash": "contentready_oip.api.index_document"
	},
	"OIP Route Log":{
		"on_update": "contentready_oip.api.enqueue_aggregate_analytics"
	},
	"Integration Request":{
		"on_update": "contentready_oip.api.update_payment_status"
	}
}

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"contentready_oip.tasks.all"
# 	],
# 	"daily": [
# 		"contentready_oip.tasks.daily"
# 	],
# 	"hourly": [
# 		"contentready_oip.tasks.hourly"
# 	],
# 	"weekly": [
# 		"contentready_oip.tasks.weekly"
# 	]
# 	"monthly": [
# 		"contentready_oip.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "contentready_oip.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "contentready_oip.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "contentready_oip.task.get_dashboard_data"
# }

