import stripe


def checkout(mode, line_items, ui_mode, return_url, subscription_data):
    session = stripe.checkout.Session.create(
        mode=mode,
        line_items=line_items,
        ui_mode=ui_mode,
        return_url=return_url,
        subscription_data = subscription_data
    )
    return session

def get_checkout_status(session_id):
    session = stripe.checkout.Session.retrieve(session_id)
    return session
