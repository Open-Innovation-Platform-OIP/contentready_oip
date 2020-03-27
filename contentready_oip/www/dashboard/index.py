import frappe
from contentready_oip import api

def get_context(context):
    # catch all
    context.recommended_problems = []
    context.recommended_solutions = []
    context.recommended_users = []
    context.user_problems = []
    context.user_solutions = []
    context.watched_problems = []
    context.watched_solutions = []
    context.contributed_problems = []
    context.contributed_solutions = []
    context.show_default_view = False
    if frappe.session.user != 'Guest':
        parameters = frappe.form_dict
        valid_types = ['recommended_areas', 'user_areas', 'watch_list', 'contributions', 'recommended_users']
        content_type = parameters.get('type')
        context.content_type = content_type
        if not content_type or content_type not in valid_types:
            context.show_default_view = True 
            dashboard_content = api.get_dashboard_content(limit_page_length=4)
            recommended_areas_length = 4
            if len(dashboard_content['recommended_solutions']) >= 2:
                context.recommended_problems = dashboard_content['recommended_problems'][:2]
            else:
                num_to_show = recommended_areas_length - len(dashboard_content['recommended_solutions'])
                context.recommended_problems = dashboard_content['recommended_problems'][:num_to_show]
            if len(dashboard_content['recommended_problems']) >= 2:
                context.recommended_solutions = dashboard_content['recommended_solutions'][:2]
            else:
                num_to_show = recommended_areas_length - len(dashboard_content['recommended_problems'])
                context.recommended_solutions = dashboard_content['recommended_solutions'][:num_to_show]
            # context.recommended_problems = dashboard_content['recommended_problems']
            # context.recommended_solutions = dashboard_content['recommended_solutions']
            context.recommended_users = dashboard_content['recommended_users'][:2]
            context.user_problems = dashboard_content['user_problems'][:2]
            context.user_solutions = dashboard_content['user_solutions'][:2]
            context.watched_problems = dashboard_content['watched_problems'][:2]
            context.watched_solutions = dashboard_content['watched_solutions'][:2]
            context.contributed_problems = dashboard_content['contributed_problems'][:2]
            context.contributed_solutions = dashboard_content['contributed_solutions'][:2]
            return context
        if content_type == 'recommended_areas':
            content_list = ['recommended_problems', 'recommended_solutions']
            dashboard_content = api.get_dashboard_content(limit_page_length=20, content_list=content_list)
            context.content_title = 'Areas Recommended For You'
            # use generic identifiers, problems & solutions, so we can create one view for all content_types
            context.problems = dashboard_content['recommended_problems']
            context.solutions = dashboard_content['recommended_solutions']
            return context
        if content_type == 'user_areas':
            content_list = ['user_problems', 'user_solutions']
            dashboard_content = api.get_dashboard_content(limit_page_length=20, content_list=content_list)
            context.content_title = 'Areas Added By You'
            context.problems = dashboard_content['user_problems']
            context.solutions = dashboard_content['user_solutions']
            return context
        if content_type == 'watch_list':
            content_list = ['watched_problems', 'watched_solutions']
            dashboard_content = api.get_dashboard_content(limit_page_length=20, content_list=content_list)
            context.content_title = 'Your Watch List'
            context.problems = dashboard_content['watched_problems']
            context.solutions = dashboard_content['watched_solutions']
            return context
        if content_type == 'contributions':
            content_list = ['contributed_problems', 'contributed_solutions']
            dashboard_content = api.get_dashboard_content(limit_page_length=20, content_list=content_list)
            context.content_title = 'Your Contributions'
            context.problems = dashboard_content['contributed_problems']
            context.solutions = dashboard_content['contributed_solutions']
            return context
        if content_type == 'recommended_users':
            content_list = ['recommended_users']
            dashboard_content = api.get_dashboard_content(limit_page_length=20, content_list=content_list)
            context.content_title = 'Users With Similar Interests'
            context.recommended_users = dashboard_content['recommended_users']
            return context
    else:
        frappe.local.flags.redirect_location = '/'
        raise frappe.Redirect
