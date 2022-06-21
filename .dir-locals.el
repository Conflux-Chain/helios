;;; Directory Local Variables
;;; For more information see (info "(emacs) Directory Variables")

((nil . (;; (eval projectile-register-project-type 'yarn '("package.json")
         ;;       :project-file "package.json"
         ;;       :compile "yarn install"
         ;;       :test "yarn test"
         ;;       :test-suffix ".test")
         (eval defun +insert-jest-expect ()
               (save-excursion
                 (goto-char (point-min))
                 (when (not (re-search-forward "from.*@jest/globals" (point-max) t))
                   (insert "// eslint-disable-next-line no-unused-vars\nimport {expect, describe, test, it, jest, afterAll, afterEach, beforeAll, beforeEach} from '@jest/globals' // prettier-ignore\n")
                   (insert "// eslint-disable-next-line no-unused-vars\nimport waitForExpect from 'wait-for-expect'\n"))))
         (eval defun +jest-test-file-p ()
               (and (buffer-file-name) (string-match-p "\\.\\(integration\.test\\|spec\\|test\\)\\.js" (buffer-file-name))))
         (eval defun +ensure-jest-expect ()
               (when (+jest-test-file-p) (+insert-jest-expect)))
         (eval add-hook 'find-file-hook '+ensure-jest-expect nil t)

         (eval defun +jest-integration-test-file-p ()
               (and (buffer-file-name) (string-match-p "\\.integration\.test\\.js" (buffer-file-name))))
         (eval defun +jest-setup-integration-test ()
               (if (+jest-integration-test-file-p)
                   (with-eval-after-load 'jest (setq-local jest-executable "yarn run test:integration"))
                 (with-eval-after-load 'jest (setq-local jest-executable "yarn run test:unit"))))
         (eval add-hook 'find-file-hook '+jest-setup-integration-test nil t)
         (eval let ((tools-file (concat (pwd) "scripts/tools.el")))
               (when (file-exists-p tools-file)
                 (load-file tools-file)))))

 ((rjsx-mode js2-mode typescript-mode) . ((lsp-enabled-clients . (ts-ls eslint))
                                          (eval . (lexical-let
                                                      ((project-directory
                                                        (car
                                                         (dir-locals-find-file default-directory))))
                                                    (set
                                                     (make-local-variable 'flycheck-javascript-eslint-executable)
                                                     (concat project-directory ".yarn/sdks/eslint/bin/eslint.js"))))))

  ((clojure-mode clojurec-mode clojurescript-mode) . ((cider-shadow-cljs-command . "yarn run shadow-cljs"))))
