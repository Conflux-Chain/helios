;;; Directory Local Variables
;;; For more information see (info "(emacs) Directory Variables")

((nil . ((eval defun +insert-jest-expect ()
               (save-excursion
                 (goto-char (point-min))
                 (when (not (re-search-forward "import.*expect.*from.*@jest/globals" (point-max) t))
                   (insert "import {expect, describe, it} from '@jest/globals'\n"))))
         (eval defun +jest-test-file-p ()
               (and (buffer-file-name) (string-match-p "\\.\\(spec\\|test\\)\\.js" (buffer-file-name))))
         (eval defun +ensure-jest-expect ()
               (when (+jest-test-file-p) (+insert-jest-expect)))
         (eval add-hook 'find-file-hook '+ensure-jest-expect nil t)))
 ((rjsx-mode js2-mode typescript-mode) . ((lsp-enabled-clients . (ts-ls eslint))
                                          (eval . (lexical-let
                                                      ((project-directory
                                                        (car
                                                         (dir-locals-find-file default-directory))))
                                                    (set
                                                     (make-local-variable 'flycheck-javascript-eslint-executable)
                                                     (concat project-directory ".yarn/sdks/eslint/bin/eslint.js")))))))