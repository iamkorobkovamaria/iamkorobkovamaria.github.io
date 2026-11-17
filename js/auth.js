// ===========================
// Авторизация через Firebase Auth (Google, GitHub)
// Роли: viewer / admin (хранятся в Realtime Database, узел roles)
// ===========================
(function () {
    'use strict';

    var auth = null;
    var db = null;
    var providerGoogle = null;
    var providerGithub = null;

    // Результат последней проверки роли
    window.AuthRole = {
        role: null,
        isFirstEntry: false,
        uid: null
    };

    function init() {
        if (typeof window.firebase === 'undefined') {
            console.error('Firebase SDK не загружен');
            return;
        }
        if (!window.firebase.apps.length) {
            window.firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        auth = window.firebase.auth();
        db = window.firebase.database();

        providerGoogle = new window.firebase.auth.GoogleAuthProvider();
        providerGithub = new window.firebase.auth.GithubAuthProvider();

        window.firebase.auth().onAuthStateChanged(function (user) {
            var panel = document.getElementById('user-panel');
            var form = document.getElementById('auth-form');
            if (!panel || !form) return;

            if (user) {
                ensureRole(user).then(function (info) {
                    window.AuthRole.role = info.role;
                    window.AuthRole.isFirstEntry = info.isFirstEntry;
                    window.AuthRole.uid = user.uid;
                    renderAuth(user, info);
                });
            } else {
                window.AuthRole.role = null;
                window.AuthRole.isFirstEntry = false;
                window.AuthRole.uid = null;
                form.hidden = false;
                panel.hidden = true;
            }
        });
    }

    function ensureRole(user) {
        var rolesRef = db.ref('roles/' + user.uid);
        return rolesRef.once('value').then(function (snapshot) {
            if (!snapshot.exists()) {
                // Первый вход пользователя в эту базу: определяем роль
                return db.ref('roles').once('value').then(function (allSnap) {
                    var isFirst = !allSnap.exists();
                    var role = isFirst ? 'admin' : 'viewer';
                    return rolesRef.set({
                        role: role,
                        email: user.email || '',
                        name: user.displayName || '',
                        createdAt: window.firebase.database.ServerValue.TIMESTAMP
                    }).then(function () {
                        return { role: role, isFirstEntry: isFirst };
                    });
                });
            }
            return { role: snapshot.val().role, isFirstEntry: false };
        });
    }

    function signInWith(provider) {
        return auth.signInWithPopup(provider).catch(function (error) {
            console.error('Ошибка входа:', error);
            var status = document.getElementById('auth-status');
            if (status) status.textContent = 'Не удалось войти: ' + error.message;
            throw error;
        });
    }

    function signOutUser() {
        return auth.signOut();
    }

    document.addEventListener('DOMContentLoaded', function () {
        init();

        var btnGoogle = document.getElementById('btn-login-google');
        var btnGithub = document.getElementById('btn-login-github');
        var btnLogout = document.getElementById('btn-logout');

        if (btnGoogle) {
            btnGoogle.addEventListener('click', function () {
                signInWith(providerGoogle);
            });
        }
        if (btnGithub) {
            btnGithub.addEventListener('click', function () {
                signInWith(providerGithub);
            });
        }
        if (btnLogout) {
            btnLogout.addEventListener('click', function () {
                signOutUser();
            });
        }
    });

    window.Auth = {
        signInGoogle: function () { return signInWith(providerGoogle); },
        signInGithub: function () { return signInWith(providerGithub); },
        signOut: signOutUser,
        currentUser: function () { return auth ? auth.currentUser : null; },
        isAdmin: function () { return window.AuthRole.role === 'admin'; }
    };

    function renderAuth(user, info) {
        var form = document.getElementById('auth-form');
        var panel = document.getElementById('user-panel');
        if (!form || !panel) return;

        form.hidden = true;
        panel.hidden = false;

        var nameEl = document.getElementById('user-name');
        var emailEl = document.getElementById('user-email');
        var roleEl = document.getElementById('user-role');
        var avatarEl = document.getElementById('user-avatar');
        var uidEl = document.getElementById('user-uid');
        var createdEl = document.getElementById('user-created');
        var lastLoginEl = document.getElementById('user-last-login');
        var firstBadge = document.getElementById('first-entry-badge');

        if (nameEl) nameEl.textContent = user.displayName || user.email.split('@')[0] || 'Пользователь';
        if (emailEl) emailEl.textContent = user.email || '';
        if (roleEl) {
            roleEl.textContent = 'Роль: ' + (info.role === 'admin' ? 'Администратор' : 'Зритель');
            roleEl.className = 'badge badge-' + info.role;
        }
        if (avatarEl) {
            if (user.photoURL) {
                avatarEl.src = user.photoURL;
                avatarEl.style.display = 'block';
            } else {
                avatarEl.style.display = 'none';
            }
        }
        if (uidEl) uidEl.textContent = user.uid;
        if (createdEl) createdEl.textContent = user.metadata ? user.metadata.creationTime : '—';
        if (lastLoginEl) lastLoginEl.textContent = user.metadata ? user.metadata.lastSignInTime : '—';
        if (firstBadge) {
            firstBadge.hidden = !info.isFirstEntry;
            if (info.isFirstEntry) {
                firstBadge.textContent = info.role === 'admin'
                    ? 'Первый вход — вам назначена роль Администратор'
                    : 'Первый вход — вам назначена роль Зритель';
            }
        }
    }
})();
